const HttpError = require("../models/http-error");
const { supabase } = require("../util/supabase");

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

const registerAddress = async (req, res, next) => {
  console.log("Create Residents Req", req.body);
  const { name, street, street2, city, state, postal_code, country, user_id } =
    req.body;

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
        res.status(201).json({ user: updateRes.data[0] });
      }
    }
  } catch (error) {
    return next(error);
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
        await createCampaignMailByMap(data[0].resident_account, res);
        await createCampaignMailByZipCodes(data[0].resident_account, res);
        res.json({
          user: data[0],
        });
      }
    }
  }
};

const createCampaignMailByMap = async (resident, res) => {
  const { data, error } = await supabase.rpc("get_nearby_campaigns", {
    residentlat: resident.lat,
    residentlng: resident.lng,
  });
  if (error) {
    console.log("Error: ", error.code, error.message);
  } else {
    createMail(data, resident.id);
  }
};

const createCampaignMailByZipCodes = async (resident, res) => {
  console.log("Resident Postal Code: ", resident.postal_code);
  const { data, error } = await supabase
    .from("campaign")
    .select("id")
    .contains("zip_codes", [resident.postal_code]);
  if (error) {
    console.log("Error: ", error.code, error.message);
    return res.status(500).json({
      message: "Error creating campaign mails",
      details: error.message,
      code: error.code,
    });
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

exports.registerAddress = registerAddress;
exports.validateAddress = validateAddress;
exports.getResidentsCount = getResidentsCount;
exports.getZipCodes = getZipCodes;
exports.getResidentsCountByZipcodes = getResidentsCountByZipcodes;
