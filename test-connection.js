require('dotenv').config();
const supabase = require('./supabase');

async function testConnection() {
    try {
        // Test 1: Simple query
        console.log('Testing database connection...');
        const { data, error } = await supabase
            .from('users')
            .select('count', { count: 'exact' });
        
        if (error) throw error;
        
        console.log('Connection successful!');
        console.log(`Found ${data} users in the database`);

        // Test 2: Insert a test user
        const testUser = {
            username: 'testuser',
            name: 'Test User',
            email: 'test@example.com',
            password: 'hashedpassword123' // In real app, hash this password
        };

        const { data: insertedUser, error: insertError } = await supabase
            .from('users')
            .insert([testUser])
            .select()
            .single();

        if (insertError) {
            if (insertError.code === '23505') { // Unique violation
                console.log('Test user already exists');
            } else {
                throw insertError;
            }
        } else {
            console.log('Successfully inserted test user:', insertedUser.email);
        }

    } catch (error) {
        console.error('Error testing connection:', error);
    }
}

testConnection();