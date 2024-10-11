const res = require("express/lib/response");
const { supabase } = require("../util/supabase");

const updateProfile = async (req, res, next) => {
  const { first_name, last_name, email, phone, user_id } = req.body;
  const { data, error } = await supabase
    .from("user_profile_resident")
    .update({
      first_name,
      last_name,
      email,
      phone,
    })
    .eq("id", user_id)
    .select("*, resident_account(*)");
  if (error) {
    return res.status(500).json({
      message: "Error updating user profile",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({ data: data });
  }
};

const updateNotifications = async (req, res, next) => {
  const {
    user_id,
    email_notifications,
    push_notifications,
    email_notifications_frequency,
  } = req.body;
  const { data, error } = await supabase
    .from("user_profile_resident")
    .update({
      email_notifications,
      push_notifications,
      email_notifications_frequency,
    })
    .eq("id", user_id);
  if (error) {
    return res.status(500).json({
      message: "Error updating notifications",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({ data: data });
  }
};

const getFeedback = async (req, res, next) => {
  const { user_id } = req.body;
  const { data, error } = await supabase
    .from("resident_feedback")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  console.log("Get Feedback data: ", data);
  if (error) {
    return res.status(500).json({
      message: "Error fetching Feedback",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({ data: data });
  }
};

const sendFeedback = async (req, res, next) => {
  const { user_id, account_id, subject, description } = req.body;
  const { data, error } = await supabase
    .from("resident_feedback")
    .insert({ user_id, account_id, subject, description })
    .select("*");
  if (error) {
    return res.status(500).json({
      message: "Error sending Feedback",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({ data: data });
  }
};

exports.updateProfile = updateProfile;
exports.updateNotifications = updateNotifications;
exports.getFeedback = getFeedback;
exports.sendFeedback = sendFeedback;
