'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { unknown, z } from 'zod';

import { Loader } from '@/components/global-components';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MailCheck, Eye, EyeOff } from 'lucide-react';
import { actionSignUpUser, socialLogin, actionLoginUser } from '@/lib/server-action/auth-action';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';

const SignUpFormSchema = z
  .object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof SignUpFormSchema>;

const Signup = () => {
  const searchParams = useSearchParams();
  const { user, loading } = useSupabaseUser();
  const [submitError, setSubmitError] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const codeExchangeError = useMemo(() => {
    return searchParams?.get('error_description') || '';
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user) {
      window.location.replace('/');
    }
  }, [user, loading]);

  if (loading) return <div>Loading...</div>;
  if (user) return <div>User already logged in</div>;

  const onSubmit = async (data: FormData) => {
    setSubmitError('');

    try {
      const result = await actionSignUpUser({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        setSubmitError(result.error || 'Signup failed');
        return;
      }

      // Check if user was created successfully
      if ('data' in result && result.data?.user) {
        console.log('Signup successful');
        setConfirmation(true);

        // Instead of checking for session, sign in the user immediately
        try {
          const signInResult = await actionLoginUser({
            email: data.email,
            password: data.password,
          });

          if (signInResult.error) {
            console.error('Auto-login failed:', signInResult.error);
            setSubmitError('Account created but auto-login failed. Please sign in manually.');
            // Redirect to login page after a delay
            setTimeout(() => {
              window.location.href = '/login?message=signup_success';
            }, 2000);
            return;
          }

          if (signInResult.data?.user) {
            console.log('Auto-login successful, redirecting to dashboard...');
            // Give a small delay to ensure session is properly set
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 1000);
          }
        } catch (loginError) {
          console.error('Auto-login error:', loginError);
          setSubmitError('Account created successfully. Please sign in manually.');
          setTimeout(() => {
            window.location.href = '/login?message=signup_success';
          }, 2000);
        }
      } else {
        setSubmitError('Signup completed but user data is missing');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setSubmitError(error.message || 'An unexpected error occurred');
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const { data, error } = await socialLogin(provider);

      if (error) {
        setSubmitError('OAuth login failed');
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      setSubmitError('OAuth login failed');
    }
  };

  const isLoading = form.formState.isSubmitting;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6 group">
            <div className="relative">
              <Image
                src={'/images/opengraph-image.png'}
                alt="Logo"
                width={60}
                height={60}
                className="rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
              />
            </div>
            <span className="ml-3 font-bold text-2xl bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              av-digital-workspaces
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Create your account
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Join our collaborative productivity platform
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          <Form {...form}>
            <form
              onChange={() => submitError && setSubmitError('')}
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {!confirmation && !codeExchangeError && (
                <>
                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            className="h-12 px-4 text-base border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-colors duration-200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={passwordVisible ? 'text' : 'password'}
                              placeholder="Create a password"
                              className="h-12 px-4 text-base border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-colors duration-200 pr-12"
                              {...field}
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
                          >
                            {passwordVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                          </button>
                        </div>
                        <FormMessage className="text-red-500 text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password Field */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={confirmPasswordVisible ? 'text' : 'password'}
                              placeholder="Confirm your password"
                              className="h-12 px-4 text-base border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-colors duration-200 pr-12"
                              {...field}
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
                          >
                            {confirmPasswordVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                          </button>
                        </div>
                        <FormMessage className="text-red-500 text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <Loader isAuth={true} size="sm" className="w-5 h-5" />
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-300 dark:border-slate-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* Social Login Buttons */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-2 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl transition-all duration-200"
                      onClick={() => handleSocialLogin('google')}
                    >
                      <FcGoogle size={20} className="mr-3" />
                      <span className="font-medium">Continue with Google</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-2 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-xl transition-all duration-200"
                      onClick={() => handleSocialLogin('github')}
                    >
                      <FaGithub size={20} className="mr-3" />
                      <span className="font-medium">Continue with GitHub</span>
                    </Button>
                  </div>
                </>
              )}

              {/* Error Messages */}
              {submitError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-red-700 dark:text-red-400 text-sm text-center font-medium">
                    {submitError}
                  </p>
                </div>
              )}

              {/* Success/Confirmation Alert */}
              {(confirmation || codeExchangeError) && (
                <Alert
                  className={clsx('border-2 rounded-xl p-4', {
                    'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200':
                      !codeExchangeError,
                    'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200':
                      codeExchangeError,
                  })}
                >
                  <div className="flex items-center space-x-3">
                    {!codeExchangeError && (
                      <MailCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                    )}
                    <div className="flex-1">
                      <AlertTitle className="font-semibold text-base mb-1">
                        {codeExchangeError ? 'Invalid Link' : 'Account Created Successfully!'}
                      </AlertTitle>
                      <AlertDescription className="text-sm opacity-90">
                        {codeExchangeError ||
                          'Your account has been created! Please wait while we establish your session...'}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              )}

              {/* Login Link */}
              <div className="text-center pt-4">
                <span className="text-slate-600 dark:text-slate-400">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold underline-offset-2 hover:underline transition-colors duration-200"
                  >
                    Sign in here
                  </Link>
                </span>
              </div>
            </form>
          </Form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            By creating an account, you agree to our{' '}
            <Link
              href="/terms-of-service"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy-policy"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
