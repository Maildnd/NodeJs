const { createClient } = require("@supabase/supabase-js");
const { supabaseUrl, supabaseKey } = require("../../config-global");

// Initialize the client
const supabase = createClient(supabaseUrl, supabaseKey);

exports.supabase = supabase;
