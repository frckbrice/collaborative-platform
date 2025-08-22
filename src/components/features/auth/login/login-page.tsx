'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormSchema } from '@/lib/schemas/auth-schemas';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/global-components';
import { actionLoginUser, socialLogin } from '@/lib/server-action/auth-action';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/client';

type FormData = z.infer<typeof FormSchema>;

const Login = () => {
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: '', password: '' },
  });

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
          const redirectTo = searchParams?.get('redirectTo') || '/dashboard';
          router.replace(redirectTo);
          return;
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router, searchParams]);

  // Handle URL parameters and messages
  useEffect(() => {
    const error = searchParams?.get('error');
    const errorDescription = searchParams?.get('error_description');
    const message = searchParams?.get('message');

    if (error) {
      let errorMessage = 'Authentication failed';

      switch (error) {
        case 'no_session':
          errorMessage = 'Please sign in to access this page';
          break;
        case 'session_error':
          errorMessage = 'Session error occurred. Please try signing in again.';
          break;
        case 'callback_error':
          errorMessage = 'Authentication callback failed. Please try again.';
          break;
        case 'no_code':
          errorMessage = 'Authentication failed. Please try again.';
          break;
        default:
          errorMessage = errorDescription || 'Authentication failed';
      }

      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }

    if (message === 'signup_success') {
      toast.success('Account created successfully! Please sign in with your credentials.');
    }
  }, [searchParams]);

  const onSubmit = async (data: FormData) => {
    setSubmitError('');
    setIsLoading(true);

    try {
      const result = await actionLoginUser({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        let errorMessage = result.error.message || 'Login failed';

        // Handle specific Supabase error messages
        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage =
            'Please check your email and click the confirmation link before signing in.';
        } else if (errorMessage.includes('signups not allowed')) {
          errorMessage = 'Account creation is currently disabled. Please contact support.';
        } else if (errorMessage.includes('For security purposes')) {
          errorMessage = 'Too many login attempts. Please wait a moment and try again.';
        }

        setSubmitError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      if (result.data?.user) {
        console.log('Login successful, redirecting to dashboard');
        toast.success('Welcome back!');

        // Get redirect URL from query params or default to dashboard
        const redirectTo = searchParams?.get('redirectTo') || '/dashboard';
        router.push(redirectTo);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
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
        const errorMessage = `${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed. Please try again.`;
        setSubmitError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      if (data?.url) {
        console.log('Redirecting to OAuth provider');
        window.location.href = data.url;
      } else {
        const errorMessage = 'Failed to initialize OAuth login';
        setSubmitError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Social login error:', error);
      const errorMessage = `${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed. Please try again.`;
      setSubmitError(errorMessage);
      toast.error(errorMessage);
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

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome back</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Sign in to your account to continue
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          <Form {...form}>
            <form
              onChange={() => {
                if (submitError) setSubmitError('');
                // Clear URL parameters if user starts typing
                if (searchParams?.get('error')) {
                  router.replace('/login', { scroll: false });
                }
              }}
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
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
                          placeholder="Enter your password"
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
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm font-medium transition-colors duration-200"
                >
                  Forgot your password?
                </Link>
              </div>

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

              {/* Sign Up Link */}
              <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium transition-colors duration-200"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
