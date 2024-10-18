const { supabase } = require("../util/supabase");

const createContactUsmessage = async (req, res, next) => {
  const { name, email, subject, message } = req.body;
  const { data, error } = await supabase
    .from("contact_us")
    .insert({ name, email, subject, message })
    .select("id");
  if (error) {
    return res.status(500).json({
      message: "Error retrieving residents count",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json(data[0]);
  }
};

exports.createContactUsmessage = createContactUsmessage;
