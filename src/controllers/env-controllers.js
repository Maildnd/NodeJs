const getEnvVariables = async (req, res, next) => {
  const envVariables = {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    GOOGLE_GEOCODE_URL: process.env.GOOGLE_GEOCODE_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    USPS_CLIENT_ID: process.env.USPS_CLIENT_ID,
    USPS_CLIENT_SECRET: process.env.USPS_CLIENT_SECRET,
    USPS_AUTH_URL: process.env.USPS_AUTH_URL,
    USPS_ADDRESS_URL: process.env.USPS_ADDRESS_URL,
  };
  res.json({
    message: "User signed up successfully",
    variables: envVariables,
  });
};

exports.getEnvVariables = getEnvVariables;
