const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Optional: Add a simple test query to verify connection
const testConnection = async () => {
    try {
        const { data, error } = await supabase.from('users').select('count').single();
        if (error) throw error;
        console.log('Supabase connected successfully');
    } catch (err) {
        console.error('Supabase connection test failed:', err.message);
    }
};

testConnection();

module.exports = supabase;