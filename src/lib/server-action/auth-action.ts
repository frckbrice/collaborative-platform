'use server';

import { z } from 'zod';
import { createClient } from '@/utils/server';
import { ensureUserProfile } from '@/utils/auth-utils';
import { FormSchema, SignUpSchema } from '@/lib/schemas/auth-schemas';
import { redirect } from 'next/navigation';
import { logger } from '@/utils/logger';

// Login action
export async function actionLoginUser({ email, password }: z.infer<typeof FormSchema>) {
  try {
    const supabase = await createClient();

    logger.info('Attempting login for:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error('Login error:', error);
      return { error };
    }

    if (!data?.user) {
      return { error: { message: 'Login failed - no user data returned' } };
    }

    logger.info('Login successful for user:', data.user.id);

    // Ensure user profile exists after successful login
    try {
      await ensureUserProfile(data.user);
      logger.info('User profile ensured successfully');
    } catch (profileError) {
      logger.error('Error ensuring user profile:', profileError);
      // Don't fail the login if profile creation fails
    }

    return { data, error: null };
  } catch (error) {
    logger.error('Unexpected error in login action:', error);
    return {
      error: {
        message:
          error instanceof Error ? error.message : 'An unexpected error occurred during login',
      },
    };
  }
}

// Signup action
export async function actionSignUpUser({
  email,
  password,
  confirmPassword,
}: z.infer<typeof SignUpSchema>) {
  try {
    // Validate passwords match
    if (password !== confirmPassword) {
      return {
        error: {
          message: 'Passwords do not match',
        },
      };
    }

    const supabase = await createClient();

    logger.info('Starting signup process for:', email);

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
        data: {
          email_confirmed: false,
        },
      },
    });

    if (error) {
      logger.error('Signup error:', error);

      // Handle specific Supabase signup errors
      if (error.message.includes('User already registered')) {
        return {
          error: {
            message: 'An account with this email already exists. Please try logging in instead.',
          },
        };
      }

      if (error.message.includes('Password should be at least')) {
        return {
          error: {
            message: 'Password must be at least 6 characters long',
          },
        };
      }

      return { error };
    }

    if (!data?.user) {
      return {
        error: {
          message: 'Signup failed - no user data returned',
        },
      };
    }

    logger.info('User created successfully:', data.user.id);

    // For email signup, user needs to confirm their email
    if (!data.user.email_confirmed_at) {
      logger.info('User needs to confirm email');

      // Don't create profile yet - wait for email confirmation
      return {
        data: {
          user: data.user,
          session: data.session,
          emailConfirmationRequired: true,
        },
        error: null,
      };
    }

    // If email is already confirmed (shouldn't happen in signup), create profile
    try {
      await ensureUserProfile(data.user);
      logger.info('User profile created successfully');
    } catch (profileError) {
      logger.error('Error creating user profile:', profileError);
      // Continue anyway - the main signup was successful
    }

    return {
      data: {
        user: data.user,
        session: data.session,
        emailConfirmationRequired: false,
      },
      error: null,
    };
  } catch (error) {
    logger.error('Unexpected error in signup action:', error);
    return {
      error: {
        message:
          error instanceof Error ? error.message : 'An unexpected error occurred during signup',
      },
    };
  }
}

// Social login action
export async function socialLogin(provider: 'google' | 'github') {
  try {
    const supabase = await createClient();

    logger.info('Starting OAuth login for provider:', provider);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      logger.error('Social login error:', error);
      return { error };
    }

    if (!data?.url) {
      return {
        error: {
          message: 'Failed to generate OAuth URL',
        },
      };
    }

    logger.info('OAuth URL generated successfully');
    return { data, error: null };
  } catch (error) {
    logger.error('Unexpected error in social login action:', error);
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred during OAuth login',
      },
    };
  }
}

// Logout action
export async function actionLogoutUser() {
  try {
    const supabase = await createClient();

    logger.info('Logging out user');

    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error('Logout error:', error);
      return { error };
    }

    logger.info('Logout successful');
    return { error: null };
  } catch (error) {
    logger.error('Unexpected error in logout action:', error);
    return {
      error: {
        message:
          error instanceof Error ? error.message : 'An unexpected error occurred during logout',
      },
    };
  }
}

// Reset password action
export async function actionResetPassword(email: string) {
  try {
    if (!email || !email.includes('@')) {
      return {
        error: {
          message: 'Please provide a valid email address',
        },
      };
    }

    const supabase = await createClient();

    logger.info('Sending password reset email to:', email);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    if (error) {
      logger.error('Reset password error:', error);

      // Handle specific error cases
      if (error.message.includes('For security purposes')) {
        return {
          error: {
            message:
              'If an account with this email exists, you will receive a password reset link shortly.',
          },
        };
      }

      return { error };
    }

    logger.info('Password reset email sent successfully');
    return { error: null };
  } catch (error) {
    logger.error('Unexpected error in reset password action:', error);
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred while sending reset email',
      },
    };
  }
}

// Update password action (for reset password flow)
export async function actionUpdatePassword(password: string) {
  try {
    if (!password || password.length < 6) {
      return {
        error: {
          message: 'Password must be at least 6 characters long',
        },
      };
    }

    const supabase = await createClient();

    logger.info('Updating user password');

    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      logger.error('Update password error:', error);
      return { error };
    }

    if (!data?.user) {
      return {
        error: {
          message: 'Failed to update password - no user data returned',
        },
      };
    }

    logger.info('Password updated successfully');
    return { data, error: null };
  } catch (error) {
    logger.error('Unexpected error in update password action:', error);
    return {
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred while updating password',
      },
    };
  }
}
