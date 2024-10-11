const HttpError = require("../models/http-error");
const { supabase } = require("../util/supabase");

let storedSession = null;

const signupUser = async (req, res, next) => {
  const { email, password, lastName, firstName, account_type } = req.body;
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        display_name: firstName + " " + lastName,
        account_type: account_type,
      },
    },
  });

  if (error) {
    return res.status(500).json({
      message: "Error Signing Up user",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({
      access_token: data.session.access_token,
      error: null,
    });
  }
};

const loginUser = async (req, res, next) => {
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
    res.json({ access_token: data.session.access_token });
  }
};

const getUserSession = async (req, res, next) => {
  const session = await supabase.auth.getSession();
  if (!session.data.session) {
    return res.status(500).json({
      message: "No session found",
      details: "No session found",
      code: "No_Session_Found",
    });
  } else {
    const userSession = session.data.session;
    const { data, error } = await supabase
      .from("user_profile_business")
      .select("*, business_account(*)")
      .eq("id", userSession.user.id);

    const plans = await supabase
      .from("subscription_plan")
      .select(
        "id, name, price, description: subscription_plan_description ( id, value)"
      );
    if (error) {
      return res.status(500).json({
        message: "Error fetching user details",
        details: error.message,
        code: error.code,
      });
    } else {
      if (data.length === 0) {
        return res.status(404).json({
          message: "User not found",
          details:
            "User not found. If you are a resident, please login through the Maildnd mobile app.",
          code: "USER_NOT_FOUND",
        });
      } else {
        res.json({
          user: data[0],
          accessToken: userSession.access_token,
          session: userSession,
          plans: plans.data,
        });
      }
    }
  }
};

const logoutUser = async (req, res, next) => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return res.status(500).json({
      message: "Error logging out user",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({ message: "User logged out successfully" });
  }
};

const resetPassword = async (req, res, next) => {
  console.log("Reset Pasword body", req.body);
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
    res.json({ message: "Success resetting password", data: data });
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
    res.json({ message: "Password updated successfully" });
  }
};

const verifyOTP = async (req, res, next) => {
  const { data, error } = await supabase.auth.verifyOtp({
    type: "recovery",
    token_hash: req.body.token_hash,
  });
  if (error) {
    return res.status(500).json({
      message: "Error verifying OTP",
      details: error.message,
      code: error.code,
    });
  } else {
    res.json({ message: "OTP verified successfully", data: data });
  }
};

exports.signupUser = signupUser;
exports.loginUser = loginUser;
exports.getUserSession = getUserSession;
exports.logoutUser = logoutUser;
exports.resetPassword = resetPassword;
exports.updatePassword = updatePassword;
exports.verifyOTP = verifyOTP;
