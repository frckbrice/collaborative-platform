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
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Loader } from '@/components/global-components';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MailCheck, Eye, EyeOff } from 'lucide-react';
import { actionSignUpUser, socialLogin } from '@/lib/server-action/auth-action';
import { SignUpSchema } from '@/lib/schemas/auth-schemas';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { toast } from 'sonner';
import { createClient } from '@/utils/client';

type FormData = z.infer<typeof SignUpSchema>;

const Signup = () => {
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const codeExchangeError = useMemo(() => {
    return searchParams?.get('error_description') || searchParams?.get('error') || '';
  }, [searchParams]);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Error checking session:', error);
          setIsCheckingAuth(false);
          return;
        }

        if (session?.user) {
          console.log('User already authenticated, redirecting to dashboard');
          router.replace('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  // Handle redirect messages
  useEffect(() => {
    const message = searchParams?.get('message');
    if (message === 'signup_success') {
      setConfirmation(true);
      toast.success(
        'Account created successfully! Please check your email to confirm your account.'
      );
    }
  }, [searchParams]);

  const onSubmit = async (data: FormData) => {
    setSubmitError('');
    setIsLoading(true);

    try {
      const result = await actionSignUpUser({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      if (result.error) {
        setSubmitError(result.error.message || 'Signup failed');
        return;
      }

      // Check if user was created successfully
      if (result.data?.user) {
        console.log('Signup successful');
        setConfirmation(true);
        toast.success(
          'Account created successfully! Please check your email to confirm your account.'
        );

        // Clear form
        form.reset();

        // Redirect to login page after a delay
        setTimeout(() => {
          router.push('/login?message=signup_success&from=signup');
        }, 3000);
      } else {
        setSubmitError('Signup completed but user data is missing');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setSubmitError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(true);
      setSubmitError('');

      const { data, error } = await socialLogin(provider);

      if (error) {
        console.error('Social login error:', error);
        setSubmitError(
          `${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed. Please try again.`
        );
        return;
      }

      if (data?.url) {
        console.log('Redirecting to OAuth provider');
        window.location.href = data.url;
      } else {
        setSubmitError('Failed to initialize OAuth login');
      }
    } catch (error: any) {
      console.error('Social login error:', error);
      setSubmitError(
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed. Please try again.`
      );
    } finally {
      // Don't set loading to false immediately for successful redirects
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-fit bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 w-full">
        <div className="text-center">
          <Loader className="w-8 h-8 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-fit bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 w-full">
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
              onChange={() => {
                if (submitError) setSubmitError('');
                if (codeExchangeError && !searchParams?.get('error')) {
                  // Clear URL parameters if user starts typing
                  router.replace('/signup', { scroll: false });
                }
              }}
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
                            disabled={isLoading}
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
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                            disabled={isLoading}
                            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200 disabled:opacity-50"
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
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                            disabled={isLoading}
                            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200 disabled:opacity-50"
                          >
                            {confirmPasswordVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                          </button>
                        </div>
                        <FormMessage className="text-red-500 text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Error Message */}
                  {submitError && (
                    <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                      {submitError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader className="w-5 h-5 mr-2" />
                        Creating account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-300 dark:border-slate-600" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* Social Login Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      onClick={() => handleSocialLogin('google')}
                      disabled={isLoading}
                      className="h-12 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FcGoogle className="w-5 h-5 mr-2" />
                      Google
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleSocialLogin('github')}
                      disabled={isLoading}
                      className="h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaGithub className="w-5 h-5 mr-2" />
                      GitHub
                    </Button>
                  </div>

                  {/* Sign In Link */}
                  <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                    Already have an account?{' '}
                    <Link
                      href="/login"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium transition-colors duration-200"
                    >
                      Sign in
                    </Link>
                  </div>
                </>
              )}

              {/* Confirmation Message */}
              {confirmation && (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <MailCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      Check your email
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      We&apos;ve sent you a confirmation link. Please check your email and click the
                      link to verify your account.
                    </p>
                  </div>
                  <div className="pt-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Redirecting to login page in a few seconds...
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => router.push('/login')}
                    variant="outline"
                    className="mt-4"
                  >
                    Go to Login
                  </Button>
                </div>
              )}

              {/* Error Message for Email Link Issues */}
              {codeExchangeError && (
                <Alert variant="destructive">
                  <AlertTitle>Authentication Error</AlertTitle>
                  <AlertDescription className="mb-4">{codeExchangeError}</AlertDescription>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        router.replace('/signup');
                        window.location.reload();
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Try Again
                    </Button>
                    <Button
                      type="button"
                      onClick={() => router.push('/login')}
                      variant="outline"
                      size="sm"
                    >
                      Go to Login
                    </Button>
                  </div>
                </Alert>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
