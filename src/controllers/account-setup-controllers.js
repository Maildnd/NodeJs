const res = require("express/lib/response");
const HttpError = require("../models/http-error");
const { supabase } = require("../util/supabase");

const getSubscriptionPlans = async (req, res, next) => {
  const { data, error } = await supabase
    .from("subscription_plan")
    .select(
      "id, name, price, description: subscription_plan_description ( id, value)"
    );
  if (error) {
    return next(new HttpError("Error fetching subscription plans", 500));
  } else {
    res.json({ subscription_plans: data });
  }
};

const getDiscounts = async (req, res, next) => {
  const { data, error } = await supabase
    .from("discount")
    .select("id, name, percent, description")
    .eq("active", true);
  if (error) {
    return next(new HttpError("Error fetching discounts", 500));
  } else {
    res.json({ discount_codes: data });
  }
};

const completeSetup = async (req, res, next) => {
  await saveBusinessDetails(req, res, next);
};

const saveBusinessDetails = async (req, res, next) => {
  const { businessDetails, selectedPlanId, paymentDetails, discount_code_id } =
    req.body;
  const {
    name,
    email,
    phone,
    website,
    country,
    street,
    street2,
    state,
    city,
    zip_code,
    user_id,
  } = JSON.parse(businessDetails);
  const { data, error } = await supabase
    .from("business_account")
    .insert({
      name,
      email,
      phone,
      website,
      street,
      street2,
      city,
      state,
      postal_code: zip_code,
      country,
    })
    .select("id");
  if (error) {
    return res.status(500).json({
      message: "Error saving business details",
      details: error.message,
      code: error.code,
    });
  } else {
    const business_id = data[0].id;
    console.log("business_id", business_id);
    // await createBusinessInvoice(business_id, discount_code_id, next);

    await createCoverImage(req.file, business_id, res, next);
    await supabase
      .from("user_profile_business")
      .update({ profile_completed: true, business_account: business_id })
      .eq("id", user_id);

    res.json({ success: "Business details saved successfully" });
  }
};

const createBusinessInvoice = async (business_id, discount_code_id, next) => {
  console.log("Invoice business_id", business_id);
  console.log("Invoice discount_code_id", discount_code_id);
  const { data, error } = await supabase.from("business_invoice").insert([
    {
      business_id: business_id,
      type: "monthly",
      amount: 0,
      status: "completed",
      discount: discount_code_id,
    },
  ]);
  if (error) {
    return next(
      new HttpError("Error saving business invoice: " + error.message, 500)
    );
  } else {
    console.log("Business Invoice saved successfully");
  }
};

const createCoverImage = async (cover_image, business_id, res, next) => {
  if (cover_image) {
    const fileBuffer = cover_image.buffer;
    const { data, error } = await supabase.storage
      .from("business_account/cover_images")
      .upload(business_id, fileBuffer, { contentType: cover_image.mimetype });
    if (error) {
      return res.status(500).json({
        message: "Error saving cover image",
        details: error.message,
        code: error.code,
      });
    } else {
      console.log("Cover image saved successfully");
      const cover_image_url = supabase.storage
        .from("business_account/cover_images")
        .getPublicUrl(business_id).data.publicUrl;
      await supabase
        .from("business_account")
        .update({ cover_image_url })
        .eq("id", business_id);
    }
  }
};

const uploadFile = async (req, res, next) => {
  try {
    const fileBuffer = req.file.buffer;
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const { data, error } = await supabase.storage
      .from("business_account/cover_images")
      .upload(fileName, fileBuffer, {
        contentType: req.file.mimetype,
      });

    if (error) {
      throw error;
    }

    const publicUrl = supabase.storage
      .from("business_account/cover_images")
      .getPublicUrl(`${fileName}`).data.publicUrl;

    res.send({
      message: "File uploaded successfully to Supabase Storage",
      fileUrl: publicUrl,
    });
  } catch (error) {
    console.error("Error uploading file to Supabase:", error.message);
    return next(
      new HttpError(
        "Error saving cover image: " + error.message + " code: " + error.code,
        500
      )
    );
  }
};

const updateUser = async (req, res, next) => {
  const { user_id } = req.body;
  const { data, error } = await supabase
    .from("user_profile_business")
    .update({ profile_completed: true })
    .eq("id", user_id);
  if (error) {
    return next(
      new HttpError(
        "Error updating user: " + error.message + " code: " + error.code,
        500
      )
    );
  }
  res.json({ message: "Business User saved successfully" });
};

const insertBusinessUser = async (req, res, next) => {
  const { id, name, email, first_name, last_name } = req.body;
  const { data, error } = await supabase
    .from("user_profile_business")
    .insert({
      id: id,
      email: email,
      name: name,
      first_name: first_name,
      last_name: last_name,
    })
    .select("id");
  if (error) {
    return next(
      new HttpError(
        "Error updating user: " + error.message + " code: " + error.code,
        500
      )
    );
  }
  res.json({ message: "Business Account saved successfully" });
};

const updateBusinessAccount = async (req, res, next) => {
  const { account_id, cover_image_url } = req.body;
  const { data, error } = await supabase
    .from("business_account")
    .update({ cover_image: cover_image_url })
    .eq("id", account_id);
  if (error) {
    return next(
      new HttpError(
        "Error updating user: " + error.message + " code: " + error.code,
        500
      )
    );
  }
  res.json({ message: "Business Account saved successfully" });
};

exports.getSubscriptionPlans = getSubscriptionPlans;
exports.saveBusinessDetails = saveBusinessDetails;
exports.completeSetup = completeSetup;
exports.getDiscounts = getDiscounts;
exports.uploadFile = uploadFile;
exports.updateUser = updateUser;
exports.insertBusinessUser = insertBusinessUser;
exports.updateBusinessAccount = updateBusinessAccount;
