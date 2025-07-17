'use server';

import { z } from 'zod';
import { createClient } from '@/utils/server';
import { FormSchema } from '../type';
import { cookies } from 'next/headers';

// Helper function to ensure user exists in app's users table
async function ensureUserProfile(user: any) {
  const supabase = await createClient();

  try {
    // Check if user exists in your app's users table
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id')
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
  const { data } = await supabase.from('profiles').select('*').eq('email', email);

  if (data?.length)
    return {
      error: {
        message: 'User already exists',
        data,
      },
    };
  const response = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      // Add this if using email confirmation:
      data: {
        email_confirm: true // Optional: requires email confirmation
      }
    },
  });

  const error = response.error;

  if (error) {
    throw error
  }

  // Ensure user profile exists in app's users table
  if (response.data?.user) {
    await ensureUserProfile(response.data.user);
  }

  return response;
}
