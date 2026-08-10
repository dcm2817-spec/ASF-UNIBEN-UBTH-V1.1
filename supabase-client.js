// Supabase connection — loaded on every page after the Supabase CDN script.
// The anon/publishable key below is safe to expose in frontend code; it's designed for that.
const SUPABASE_URL = 'https://hmemcurrxiktykfwzxxd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xptPXqbWXN7XhctlNC7TCQ_jf8WUR7Q';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
