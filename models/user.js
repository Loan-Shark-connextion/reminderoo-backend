const bcrypt = require('bcrypt');
const supabase = require('../db');

class User {
    static async create(username, email, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const defaultProfilePicture = `../public/images/default_profiles/default_${Math.floor(Math.random() * 5) + 1}.jpg`;
        
        const { data, error } = await supabase
            .from('users')
            .insert([
                { username, email, password: hashedPassword, profile_picture: defaultProfilePicture }
            ])
            .select('id')
            .single();
            
        if (error) throw error;
        return data.id;
    }

    static async findByEmail(email) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
            
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    static async updateProfilePicture(userId, profilePicture) {
        const { error } = await supabase
            .from('users')
            .update({ profile_picture: profilePicture })
            .eq('id', userId);
            
        if (error) throw error;
    }

    static async findById(userId) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    static async updateProfile(userId, { username, email, phoneNumber }) {
        const { data, error } = await supabase
            .from('users')
            .update({ 
                username, 
                email, 
                phone_number: phoneNumber 
            })
            .eq('id', userId)
            .select()
            .single();
            
        if (error) throw error;
        return data;
    }

    static async updatePassword(userId, newHashedPassword) {
        const { error } = await supabase
            .from('users')
            .update({ password: newHashedPassword })
            .eq('id', userId);
            
        if (error) throw error;
    }
}

module.exports = User;