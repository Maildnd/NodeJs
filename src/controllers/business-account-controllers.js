const res = require("express/lib/response");
const HttpError = require("../models/http-error");
const { supabase } = require("../util/supabase");

const getBusinessAccount = async (req, res, next) => {
  const session = await supabase.auth.getSession();
  if (!session.data.session) {
    return res.status(500).json({
      message: "No Session Found",
      details: "No Session Found",
      code: "No_Session_Found",
    });
  } else {
    const userSession = session.data.session;
    const { data, error } = await supabase
      .from("user_profile_business")
      .select(
        "first_name, last_name, business_account(id, name, email, phone, cover_image, subscription, street, street2, city, state, postal_code, country)"
      )
      .eq("id", userSession.user.id);

    if (error) {
      return res.status(500).json({
        message: "Error fetching business account",
        details: error.message,
        code: error.code,
      });
    } else {
      const plans = await supabase
        .from("subscription_plan")
        .select(
          "id, name, price, description: subscription_plan_description ( id, value)"
        );
      res.json({ business_details: data, subscription_plans: plans.data });
    }
  }
};

const updateBusinessAccount = async (req, res, next) => {
  const { businessDetails } = req.body;
  const {
    first_name,
    last_name,
    email,
    phone,
    website,
    street,
    street2,
    city,
    state,
    zip_code,
    id,
  } = JSON.parse(businessDetails);
  const updateValues = {
    name: first_name + " " + last_name,
    email,
    phone,
    website,
    street,
    street2,
    city,
    state,
    postal_code: zip_code,
    id,
  };
  const { data, error } = await supabase
    .from("business_account")
    .update(updateValues)
    .eq("id", id);

  if (error) {
    return res.status(500).json({
      message: "Error fetching business account",
      details: error.message,
      code: error.code,
    });
  } else {
    console.log("business data", data);

    if (req.file) {
      await replaceCoverImage(req.file, id, next);
    }
    res.json({ data: data });
  }
};

const replaceCoverImage = async (cover_image, business_id, next) => {
  if (cover_image) {
    const fileBuffer = cover_image.buffer;
    console.log("fileBuffer", fileBuffer);
    const { data, error } = await supabase.storage
      .from("business_account/cover_images")
      .update(business_id, fileBuffer, {
        contentType: cover_image.mimetype,
      });
    if (error) {
      return res.status(500).json({
        message: "Error replacing cover image",
        details: error.message,
        code: error.code,
      });
    } else {
      console.log("Cover image updated successfully");
    }
  }
};

exports.getBusinessAccount = getBusinessAccount;
exports.updateBusinessAccount = updateBusinessAccount;
