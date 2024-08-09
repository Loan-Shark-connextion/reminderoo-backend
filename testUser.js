const User = require('./models/user');

async function testUser() {
    try {
        const userId = await User.create('testuser', 'Test User', 'testuser  @example.com', 'password123');
        console.log('User created with ID:', userId);

        const user = await User.findByEmail('test@example.com');
        console.log('Found user:', user);
        if (user) {
            console.log('User name:', user.name);
        }
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testUser();