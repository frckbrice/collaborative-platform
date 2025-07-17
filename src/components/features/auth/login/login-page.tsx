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
    <div className='flex justify-center items-center h-screen'>
      <Form {...form}>
        <form
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
              av-digital-workspaces.
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
        </form>
      </Form>
    </div>
  );
}
