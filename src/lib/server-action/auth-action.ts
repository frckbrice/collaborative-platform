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
    // Check if user already exists in app's users table
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      return;
    }

    if (!existing) {
      // Insert user into your app's users table
      const { error: insertError } = await supabase.from('users').insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error('Error inserting user profile:', insertError);
      } else {
        console.log('User profile created in app users table:', user.email);
      }
    }
  } catch (error) {
    console.error('Error ensuring user profile:', error);
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
  console.log("\n\nprovider", provider);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
    },
  });

  console.log("\n\n data", data);
  console.log("\n\n error", error);

  if (error) {
    return { error };
  }

  

  return { data };
}

export async function actionSignUpUser({ email, password }: z.infer<typeof FormSchema>) {
  const supabase = await createClient();
  
  try {
    // Use server-side environment variable for callback URL
    const callbackUrl = process.env.SITE_URL ? `${process.env.SITE_URL}/api/auth/callback` : 'http://localhost:3000/api/auth/callback';
    console.log('Signup - Using callback URL:', callbackUrl);
    
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: callbackUrl,
        data: {
          // Remove email_confirm requirement for now
        }
      },
    });

    const error = response.error;

    if (error) {
      console.error('Signup error:', error);
      throw error;
    }

    // For testing: Auto-confirm the user if email confirmation is not required
    if (response.data?.user && !response.data.user.email_confirmed_at) {
      console.log('User created but email not confirmed. For testing, you can manually confirm in Supabase dashboard.');
    }

    // Ensure user profile exists in app's users table
    if (response.data?.user) {
      await ensureUserProfile(response.data.user);
    }

    return response;
  } catch (error) {
    console.error('Signup error in action:', error);
    throw error;
  }
}
