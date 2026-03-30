require("dotenv").config();
require("dotenv").config({ path: ".env.production" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ SUPABASE_URL et SUPABASE_SERVICE_KEY sont requis dans .env ou .env.production");
  console.error("Actual env:", { SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_KEY: supabaseServiceKey ? '*****' : undefined });
  throw new Error("❌SUPABASE_URL et SUPABASE_SERVICE_KEY sont requis");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

console.log("✅ Client Supabase initialisé");

module.exports = supabase;