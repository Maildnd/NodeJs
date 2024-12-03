const { supabase } = require("../util/supabase");
const { supabaseAdmin } = require("../util/supabase");

let storedSession = null;

const signupUser = async (req, res, next) => {
  const { email, password, last_name, first_name, referral_code } = req.body;
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        first_name: first_name,
        last_name: last_name,
        display_name: first_name + " " + last_name,
        account_type: "resident",
        referral_code: referral_code,
      },
    },
  });

  if (error) {
    console.log("Sign up Error: ", error);
    return res.status(500).json({
      message: "Error Signing Up user",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({
      message: "User signed up successfully",
    });
  }
};

const loginUser = async (req, res, next) => {
  console.log("Login User: ", req.body);
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });
  if (error) {
    return res.status(500).json({
      message: "Error Logging In user",
      details: error.message,
      code: error.code,
    });
  } else {
    storedSession = data.session;
    getUserData(data.user.id, data.session.access_token, res, next);
  }
};

const getUserData = async (user_id, access_token, res, next) => {
  console.log("User ID: ", user_id);
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
        details:
          "User not found. If you are a business user, please login using the Maildnd website.",
        code: "USER_NOT_FOUND",
      });
    } else {
      res.json({
        user: data[0],
        access_token: access_token,
      });
    }
  }
};

const requestOTP = async (req, res, next) => {
  const { email } = req.body;
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    return res.status(500).json({
      message: "Error sending OTP",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({ message: "OTP sent successfully" });
  }
};

const verifyOTP = async (req, res, next) => {
  const { token, email } = req.body;
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return res.status(500).json({
      message: "Error verifying email",
      details: error.message,
      code: error.code,
    });
  } else {
    getUserData(data.user.id, data.session.access_token, res, next);
  }
};

const resendOTP = async (req, res, next) => {
  const { email } = req.body;
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email,
  });
  if (error) {
    return res.status(500).json({
      message: "Error sending OTP",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({ message: "OTP sent successfully" });
  }
};

const logoutUser = async (req, res, next) => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return res.status(500).json({
      message: "Error Logging Out user",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({ message: "User logged out successfully" });
  }
};

const updatePassword = async (req, res, next) => {
  const { password } = req.body;
  const { error } = await supabase.auth.updateUser({
    password: password,
  });
  if (error) {
    return res.status(500).json({
      message: "Error updating password",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({ message: "Password update successful" });
  }
};

const deleteAccount = async (req, res, next) => {
  const { account_id } = req.body;
  const { data, error } = await supabase
    .from("resident_account")
    .update({ delete_request: true })
    .eq("id", account_id);
  if (error) {
    return res.status(500).json({
      message: "Error deleting user",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({ message: "User deleted successfully" });
  }
};

const deleteUser = async (req, res, next) => {
  const { user_id } = req.body;

  const response = await supabase
    .from("user_profile_resident")
    .delete()
    .eq("id", user_id);
  console.log("Response: ", response);
  if (response.error) {
    return res.status(500).json({
      message: "Error deleting user profile",
      details: error.message,
      code: error.code,
    });
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(user_id);

    if (error) {
      return res.status(500).json({
        message: "Error deleting user",
        details: error.message,
        code: error.code,
      });
    } else {
      res.json({ message: "User deleted successfully" });
    }
  }
};

exports.signupUser = signupUser;
exports.loginUser = loginUser;
exports.requestOTP = requestOTP;
exports.verifyOTP = verifyOTP;
exports.resendOTP = resendOTP;
exports.logoutUser = logoutUser;
exports.updatePassword = updatePassword;
exports.deleteAccount = deleteAccount;
exports.deleteUser = deleteUser;
