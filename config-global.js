const e = require("express");

require("dotenv").config();

// Google Maps API
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_GEOCODE_URL = process.env.GOOGLE_GEOCODE_URL;

// Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// USPS
const USPS_CLIENT_ID = process.env.USPS_CLIENT_ID;
const USPS_CLIENT_SECRET = process.env.USPS_CLIENT_SECRET;
const USPS_AUTH_URL = process.env.USPS_AUTH_URL;
const USPS_ADDRESS_URL = process.env.USPS_ADDRESS_URL;

// -----------------------------------

exports.GOOGLE_API_KEY = GOOGLE_API_KEY;
exports.GOOGLE_GEOCODE_URL = GOOGLE_GEOCODE_URL;

exports.supabaseKey = supabaseKey;
exports.supabaseUrl = supabaseUrl;
exports.supabaseServiceRoleKey = supabaseServiceRoleKey;

exports.USPS_CLIENT_ID = USPS_CLIENT_ID;
exports.USPS_CLIENT_SECRET = USPS_CLIENT_SECRET;
exports.USPS_AUTH_URL = USPS_AUTH_URL;
exports.USPS_ADDRESS_URL = USPS_ADDRESS_URL;
