'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSchema } from '@/lib/type';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
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
import { useState } from 'react';
import { useEffect } from 'react';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';

type FormData = z.infer<typeof FormSchema>;

export function LoginPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [sessionMissing, setSessionMissing] = useState(false);
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');
  const { user, loading } = useSupabaseUser();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  // Handle success messages from signup
  useEffect(() => {
    const message = searchParams?.get('message');
    if (message === 'signup_success') {
      toast.success('Account created successfully! Please sign in.');
    }
  }, [searchParams]);

  if (loading) return null;
  if (user) return null;

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);

    try {
      const response = await actionLoginUser(data);

      if (response?.error) {
        setSubmitError(response.error.message);
        return;
      }

      // Check for user in different possible locations
      const user = response?.data?.user;

      if (user) {
        toast.success('Successfully logged in!');
        router.replace('/dashboard');
      } else {
        toast.error('Invalid login credentials');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const { data, error } = await socialLogin(provider);

      if (error) {
        toast.error('OAuth login failed');
        return;
      }

      if (data?.url) {
        // Redirect to the OAuth URL
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error('OAuth login failed');
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
                width={100}
                height={100}
                className="rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
              />
            </div>
            <span className="ml-3 font-bold text-4xl bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
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
              onChange={() => submitError && setSubmitError(null)}
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

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error Messages */}
              {submitError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-red-700 dark:text-red-400 text-sm text-center font-medium">
                    {submitError}
                  </p>
                </div>
              )}

              {errorMessage && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-red-700 dark:text-red-400 text-sm text-center font-medium">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                disabled={isLoading || !!errorMessage}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <Loader isAuth={true} size="sm" className="w-5 h-5" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  'Sign In'
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

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <span className="text-slate-600 dark:text-slate-400">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/signup"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold underline-offset-2 hover:underline transition-colors duration-200"
                  >
                    Create one here
                  </Link>
                </span>
              </div>
            </form>
          </Form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            By signing in, you agree to our{' '}
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
}
