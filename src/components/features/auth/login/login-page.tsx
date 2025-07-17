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
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type FormData = z.infer<typeof FormSchema>;

export function LoginPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [sessionMissing, setSessionMissing] = useState(false);
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');

  // useEffect(() => {
  //   setTimeout(() => {
  //     const checkSession = async () => {
  //       const supabase = createClientComponentClient();
  //       const { data } = await supabase.auth.getSession();
  //       if (!data.session) {
  //         setSessionMissing(true);
  //       }
  //     };
  //     checkSession();
  //     // Check for error query params
  //     const error = searchParams?.get('error');
  //     console.log("error: ", error);
  //     let errorMessage = '';
  //     if (error === 'auth_failed') {
  //       errorMessage = 'Authentication failed. Please try the password reset process again.';
  //     } else if (error === 'no_code') {
  //       errorMessage = 'No reset code found. Please use the reset link from your email or try again.';
  //     }
  //     setErrorMessage(errorMessage);
  //   }, 1000);
  // }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {

    setSubmitError(null);

    try {
      const response = await actionLoginUser(data);

      console.log('Login response:', response);
      console.log('Response data:', response?.data);
      console.log('Response error:', response?.error);

      if (response?.error) {
        setSubmitError(response.error.message);
        return;
      }

      // Check for user in different possible locations
      const user = response?.data?.user;

      if (user) {
        console.log('User found:', user);
        toast.success('Successfully logged in!');
        router.replace('/dashboard');
      } else {
        console.log('No user found in response');
        toast.error('Invalid login credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleSocialLogin = (provider: 'google' | 'github') => {
    socialLogin(provider);
  };

  const isLoading = form.formState.isSubmitting;

  return (
    <div className='flex justify-center items-center h-screen'>
      <Form {...form}>
        {/* {sessionMissing ? (
          <div className="mb-4 w-full text-center text-red-600 bg-red-100 dark:bg-red-900/30 rounded p-3">
            Your password reset session is missing or expired.<br />
            Please use the reset link from your email, or request a new password reset.
          </div>
        ) : */}
        (<form
          onChange={() => submitError && setSubmitError(null)}
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-[430px] sm:w-[400px] space-y-6 flex flex-col shadow-2xl p-5"
        >
          <Link href="/" className="w-full flex justify-left items-center">
            <Image
              src={'/images/opengraph-image.png'}
              alt="cypress Logo"
              width={70}
              height={70}
              className="rounded-lg dark:shadow-2xl dark:shadow-white"
            />
            <span className="font-semibold dark:text-white text-4xl first-letter:ml-2">
              Maebrie.
            </span>
          </Link>

          <FormDescription className="text-foreground/60">
            realtime Collaborative and Productivity Platform
          </FormDescription>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="email" placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={passwordVisible ? 'text' : 'password'}
                      placeholder="Password"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute top-1/4 right-2"
                  >
                    {passwordVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Link href="/forgot-password" className="text-sm text-primary hover:underline self-end mb-2">Forgot password?</Link>

          {submitError && <FormMessage>{submitError}</FormMessage>}
          {errorMessage && (
            <div className="mb-4 w-full text-center text-red-600 bg-red-100 dark:bg-red-900/30 rounded p-3">
              {errorMessage}
            </div>
          )}
          <Button type="submit" className="w-full p-6" disabled={isLoading || !!errorMessage}>
            {isLoading ? <Loader isAuth={true} /> : 'Login'}
          </Button>

          <div className='flex flex-col gap-2'>
            <div className="flex items-center justify-center w-full">
              <div className="w-full h-[1px] bg-border" />
              <span className="px-2 text-muted-foreground">OR</span>
              <div className="w-full h-[1px] bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => handleSocialLogin('google')}
            >
              <FcGoogle size={24} />
              <span>Continue with Google</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => handleSocialLogin('github')}
            >
              <FaGithub size={24} />
              <span>Continue with GitHub</span>
            </Button>
          </div>

          <span className="self-container">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary">
              Sign Up
            </Link>
          </span>
        </form>)
        {/* } */}
      </Form>
    </div>
  );
}
