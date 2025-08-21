'use server';

import { createClient } from '@/utils/server';
import { z } from 'zod';
import { FormSchema } from '@/lib/type';
import { User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Helper function to ensure user exists in app's users table
async function ensureUserProfile(user: User) {
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

      // Create a simple user profile without complex references
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

export async function actionLoginUser({ email, password }: z.infer<typeof FormSchema>) {
  const supabase = await createClient();
  const response = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Ensure user profile exists in app's users table
  if (response.data?.user) {
    await ensureUserProfile(response.data.user);
  }

  return response;
}

export async function socialLogin(provider: 'google' | 'github') {
  const supabase = await createClient();
  console.log('\n\nprovider', provider);

  // Use server-side OAuth flow to avoid PKCE issues
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      // Force server-side flow to avoid PKCE issues
      flowType: 'pkce',
      // Ensure we're using the correct site URL
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  console.log('\n\n data', data);
  console.log('\n\n error', error);

  if (error) {
    return { error };
  }

  return { data };
}

export async function actionSignUpUser({ email, password }: z.infer<typeof FormSchema>) {
  const supabase = await createClient();

  try {
    console.log('Starting signup process for:', email);

    // Sign up the user - remove email confirmation requirement
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Remove emailRedirectTo to disable email confirmation
        data: {
          // No additional metadata needed
        },
      },
    });

    const error = response.error;

    if (error) {
      console.error('Signup error:', error);
      return { error: error.message };
    }

    if (response.data?.user) {
      console.log('User created successfully:', response.data.user.id);

      // Don't try to use admin functions here - they require service role
      // Instead, just ensure user profile creation
      try {
        await ensureUserProfile(response.data.user);
        console.log('User profile ensured in app users table');
      } catch (profileError) {
        console.error('Error ensuring user profile:', profileError);
        // Continue anyway - the main signup was successful
      }

      return {
        data: {
          user: response.data.user,
          session: response.data.session,
        },
        error: null,
      };
    }

    return response;
  } catch (error: any) {
    console.error('Signup error in action:', error);
    return { error: error.message || 'An unexpected error occurred' };
  }
}
