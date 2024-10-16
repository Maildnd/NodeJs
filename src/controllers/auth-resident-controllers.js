const { supabase } = require("../util/supabase");

let storedSession = null;

const signupUser = async (req, res, next) => {
  const { email, password, last_name, first_name } = req.body;
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        first_name: first_name,
        last_name: last_name,
        display_name: first_name + " " + last_name,
        account_type: "resident",
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
    getUserData(data.user.id, data.session.access_token, res, next);
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

const resetPassword = async (req, res, next) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    req.body.email,
    {
      redirectTo: req.body.redirectTo,
    }
  );
  if (error) {
    return res.status(500).json({
      message: "Error resetting password",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({ message: "Password reset request successful", data: data });
  }
};

const updatePassword = async (req, res, next) => {
  const { error } = await supabase.auth.updateUser({
    password: req.body.password,
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

exports.signupUser = signupUser;
exports.loginUser = loginUser;
exports.logoutUser = logoutUser;
exports.resetPassword = resetPassword;
exports.updatePassword = updatePassword;
