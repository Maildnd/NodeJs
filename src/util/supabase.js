const { createClient } = require("@supabase/supabase-js");
const {
  supabaseUrl,
  supabaseKey,
  supabaseServiceRoleKey,
} = require("../../config-global");

// Initialize the client
const supabase = createClient(supabaseUrl, supabaseKey);

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

exports.supabase = supabase;
exports.supabaseAdmin = supabaseAdmin;
