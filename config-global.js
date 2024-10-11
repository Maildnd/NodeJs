require("dotenv").config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_GEOCODE_URL = process.env.GOOGLE_GEOCODE_URL;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.GOOGLE_API_KEY = GOOGLE_API_KEY;
exports.GOOGLE_GEOCODE_URL = GOOGLE_GEOCODE_URL;
exports.supabaseKey = supabaseKey;
exports.supabaseUrl = supabaseUrl;
exports.supabaseServiceRoleKey = supabaseServiceRoleKey;
