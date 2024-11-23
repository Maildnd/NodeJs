const HttpError = require("../models/http-error");
const { supabase } = require("../util/supabase");
const axios = require("axios");
const {
  USPS_CLIENT_ID,
  USPS_CLIENT_SECRET,
  USPS_AUTH_URL,
  USPS_ADDRESS_URL,
} = require("../../config-global");

const getCoordsForAddress = require("../util/location");
const res = require("express/lib/response");

const getResidentsCount = async (req, res, next) => {
  const { selectedlat, selectedlng, radius } = req.body;
  const { data, error } = await supabase.rpc("get_nearby_residents_count", {
    selectedlat,
    selectedlng,
    radius,
  });
  if (error) {
    return res.status(500).json({
      message: "Error retrieving residents count",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({
      residents: data[0].residents_count,
    });
  }
};

const getZipCodes = async (req, res, next) => {
  const { data, error } = await supabase
    .from("zip_codes")
    .select("*, county(*)");
  if (error) {
    return res.status(500).json({
      message: "Error retrieving residents count",
      details: error.message,
      code: error.code,
    });
  } else {
    let zipCodes = [];
    data.forEach((zip) => {
      zipCodes.push({
        code: zip.code,
        county: zip.county.name,
        state: zip.county.state,
        name: zip.name,
        id: zip.id,
      });
    });
    res.json({
      zip_codes: zipCodes,
    });
  }
};

const getResidentsCountByZipcodes = async (req, res, next) => {
  const { zip_codes } = req.body;
  const { data, error } = await supabase
    .from("resident_account")
    .select("id")
    .in("postal_code", zip_codes);
  if (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Error retrieving residents count",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({
      residents: data.length,
    });
  }
};

const connectByCode = async (req, res, next) => {
  const { code, user_id } = req.body;
  const { data, error } = await supabase.rpc("get_resident_account_by_code", {
    code,
  });
  if (error) {
    return res.status(500).json({
      message: "Error retrieving resident account by code",
      details: error.message,
      code: error.code,
    });
  } else {
    const updateRes = await supabase
      .from("user_profile_resident")
      .update({ resident_account: data[0].id, profile_completed: true })
      .select("*, resident_account(*)")
      .eq("id", user_id);
    if (updateRes.error) {
      return res.status(500).json({
        message: "Error connecting to resident account",
        details: updateRes.error.message,
        code: updateRes.error.code,
      });
    } else {
      res.json({ user: updateRes.data[0] });
    }
  }
};

const validateAddressUSPS = async (req, res, next) => {
  const { street, street2_type, street2, city, state, postal_code } = req.body;

  const access_token = await authorizeUSPSAccount();

  const address_params_initial = {
    streetAddress: street,
    city,
    state,
    ZIPCode: postal_code,
  };

  const initialResponse = await getUSPSAddress(
    access_token,
    address_params_initial
  );
  if (initialResponse.dpv_confirmation == "Y") {
    res.json({ usps_address: initialResponse.usps_address });
  } else {
    const address_params_secondary = {
      ...address_params_initial,
      secondaryAddress: street2,
    };
    const secondaryResponse = await getUSPSAddress(
      access_token,
      address_params_secondary
    );
    if (secondaryResponse.dpv_confirmation == "Y") {
      res.json({ usps_address: secondaryResponse.usps_address });
    } else if (
      secondaryResponse.dpv_confirmation == "D" ||
      secondaryResponse.dpv_confirmation == "S"
    ) {
      res.status(500).json({
        message: "Could not validate the address",
        details:
          "Address line 2 is invalid. Please provide a valid secondary address.",
        code: "ADDRESS_VALIDATION_ERROR",
      });
    } else {
      res.status(500).json({
        message: "Could not validate the address",
        details:
          "Could not validate the address. Please provide a valid address.",
        code: "ADDRESS_VALIDATION_ERROR",
      });
    }
  }
};

const authorizeUSPSAccount = async () => {
  const params = {
    grant_type: "client_credentials",
    client_id: USPS_CLIENT_ID,
    client_secret: USPS_CLIENT_SECRET,
  };
  try {
    const response = await axios.post(USPS_AUTH_URL, params);
    return response.data.access_token;
  } catch (error) {
    return res.status(500).json({
      message: "Could not access USPS API",
      details:
        "Error during validating address. Please try after sometime. If the error persists, please contact support.",
      code: "USPS_API_AUTH_ERROR",
    });
  }
};

const getUSPSAddress = async (access_token, address_params) => {
  console.log("Address Params: ", address_params);
  try {
    const response = await axios.get(USPS_ADDRESS_URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params: address_params,
    });
    const dpv_confirmation = response.data.additionalInfo.DPVConfirmation;
    const addressData = response.data.address;
    const usps_address = {
      street: addressData.streetAddress,
      street2: dpv_confirmation == "Y" ? addressData.secondaryAddress : "",
      city: addressData.city,
      state: addressData.state,
      postal_code: addressData.ZIPCode + "-" + addressData.ZIPPlus4,
    };

    return { usps_address, dpv_confirmation };
  } catch (error) {
    return res.status(500).json({
      message: "Could not validate the address",
      details:
        "Error during validating address. Please try after sometime. If the error persists, please contact support.",
      code: "ADDRESS_VALIDATION_ERROR",
    });
  }
};

const checkExistingAddress = async (
  street,
  street2,
  city,
  state,
  postal_code,
  res
) => {
  const query = supabase
    .from("resident_account")
    .select("id")
    .eq("street", street)
    .eq("postal_code", postal_code)
    .eq("city", city)
    .eq("state", state)
    .eq("verified", true);

  if (street2 !== null) {
    query.eq("street2", street2);
  }

  const existingAddress = await query;

  console.log("Existing Address: ", existingAddress);

  if (existingAddress.data) {
    if (existingAddress.data.length > 0) {
      res.status(500).json({
        message: "Address already exists",
        details:
          "The address provided is already registered with us. Please use a different address.",
        code: "ADDRESS_EXISTS",
      });
      return true;
    }
  } else {
    res.status(500).json({
      message: "Error fetching address",
      details: existingAddress.error.message,
      code: existingAddress.error.code,
    });
    return true;
  }
  return false;
};

const registerAddress = async (req, res, next) => {
  console.log("Create Residents Req", req.body);
  const { name, street, street2, city, state, postal_code, country, user_id } =
    req.body;

  const addressExists = await checkExistingAddress(
    street,
    street2,
    city,
    state,
    postal_code,
    res
  );
  if (addressExists) {
    return;
  }

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(
      `${street}, ${city}, ${state}, ${postal_code}, ${country}`
    );
    console.log("Coordinates: ", coordinates);
    const values = {
      name,
      street,
      street2,
      city,
      state,
      postal_code,
      country,
      lat: coordinates.lat,
      lng: coordinates.lng,
    };

    const { data, error } = await supabase
      .from("resident_account")
      .insert(values)
      .select("id");
    if (error) {
      return res.status(500).json({
        message: "Error registering the address",
        details: error.message,
        code: error.code,
      });
    } else {
      const updateRes = await supabase
        .from("user_profile_resident")
        .update({ profile_completed: true, resident_account: data[0].id })
        .eq("id", user_id)
        .select("*, resident_account(*)");

      if (updateRes.error) {
        return res.status(500).json({
          message: "Error updating user profile:",
          details: updateRes.error.message,
          code: updateRes.error.code,
        });
      } else {
        try {
          await createCampaignMailByMap(updateRes.data[0].resident_account);
          await createCampaignMailByZipCodes(
            updateRes.data[0].resident_account
          );

          res.status(201).json({ user: updateRes.data[0] });
        } catch (error) {
          return res.status(500).json({
            message: "Error creating campaign mails",
            details: "Error creating campaign mails",
            code: "CAMPAIGN_MAIL_ERROR",
          });
        }
      }
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error registering the address:",
      details: error.message,
      code: error.code,
    });
  }
};

const validateAddress = async (req, res, next) => {
  const { account_id, user_id } = req.body;

  const { data, error } = await supabase
    .from("resident_account")
    .update({ verified: true })
    .eq("id", account_id);
  if (error) {
    return res.status(500).json({
      message: "Error validating resident address",
      details: error.message,
      code: error.code,
    });
  } else {
    const { data, error } = await supabase
      .from("user_profile_resident")
      .select("*, resident_account(*)")
      .eq("id", user_id);
    console.log("User Data: ", data);
    if (error) {
      return res.status(500).json({
        message: "Error fetching user profile",
        details: error.message,
        code: error.code,
      });
    } else {
      if (data.length === 0) {
        return res.status(500).json({
          message: "User not found",
          details: "User with the given id not found",
          code: "USER_NOT_FOUND",
        });
      } else {
        res.json({
          user: data[0],
        });
      }
    }
  }
};

const createCampaignMailByMap = async (resident) => {
  const { data, error } = await supabase.rpc("get_nearby_campaigns", {
    residentlat: resident.lat,
    residentlng: resident.lng,
  });
  if (error) {
    console.log("Error: ", error.code, error.message);
    return next(error);
  } else {
    createMail(data, resident.id);
  }
};

const createCampaignMailByZipCodes = async (resident) => {
  const { data, error } = await supabase
    .from("campaign")
    .select("id")
    .contains("zip_codes", [resident.postal_code]);
  if (error) {
    console.log("Error: ", error.code, error.message);
    return next(error);
  } else {
    createMail(data, resident.id);
  }
};

const createMail = async (data, residentId) => {
  mailData = [];
  data.forEach((campaign) => {
    const mail = {
      campaign: campaign.id,
      resident_account: residentId,
    };
    mailData.push(mail);
  });
  const mailInsertRes = await supabase.from("mail").insert(mailData);
  if (mailInsertRes.error) {
    console.error(
      "Error creating campaign mail:",
      JSON.stringify(mailInsertRes.error.message)
    );
  } else {
    console.log("Campaign mail created successfully: ", data);
  }
};

exports.validateAddressUSPS = validateAddressUSPS;
exports.registerAddress = registerAddress;
exports.validateAddress = validateAddress;
exports.getResidentsCount = getResidentsCount;
exports.connectByCode = connectByCode;
exports.getZipCodes = getZipCodes;
exports.getResidentsCountByZipcodes = getResidentsCountByZipcodes;
