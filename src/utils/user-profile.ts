import { createClient } from '@/utils/server';

/**
 * Ensures a user profile exists in the app's users table
 * This function is called after successful authentication (login, signup, OAuth)
 * to ensure the user has a profile record in the database
 */
export async function ensureUserProfile(user: any) {
  const supabase = await createClient();

  try {
    console.log('Ensuring user profile exists for:', user.id, user.email);

    // Check if user already exists in app's users table
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error checking existing user:', checkError);
      return;
    }

    if (!existing) {
      console.log('User not found in app users table, creating profile...');

      // Create a user profile in the app's users table
      const userProfile = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        updated_at: new Date().toISOString(),
      };

      console.log('Attempting to insert user profile:', userProfile);

      // Insert user into your app's users table
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert(userProfile)
        .select();

      if (insertError) {
        console.error('Error inserting user profile:', insertError);
        // Don't throw error, just log it
        return;
      } else {
        console.log('User profile created successfully in app users table:', insertData);
      }
    } else {
      console.log('User profile already exists in app users table');
    }
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    // Don't throw error, just log it
  }
}

/**
 * Gets a user profile from the app's users table
 */
export async function getUserProfile(userId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

    if (error) {
      console.error('Error getting user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Updates a user profile in the app's users table
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<{
    full_name: string;
    avatar_url: string;
    billing_address: any;
    payment_method: any;
  }>
) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error updating user profile:', error);
      return { error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      error: {
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
    };
  }
}
