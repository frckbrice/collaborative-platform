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
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Loader } from '@/components/global-components';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MailCheck } from 'lucide-react';
import { actionSignUpUser, socialLogin } from '@/lib/server-action/auth-action';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

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
  const [submitError, setSubmitError] = useState('');
  const [confirmation, setConfirmation] = useState(false);

  const codeExchangeError = useMemo(() => {
    return searchParams?.get('error_description') || '';
  }, [searchParams]);

  const form = useForm<FormData>({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: FormData) => {
    console.log('Form data:', data);

    setSubmitError('');

    try {
      const { error } = await actionSignUpUser({
        email: data.email,
        password: data.password
      });



      if (error) {
        setSubmitError(error.message);
        return;
      }

      setConfirmation(true);
    } catch (error: any) {
      console.error('Signup error:', error);
      setSubmitError(error.message || 'An unexpected error occurred');
    }
  };

  const handleSocialLogin = (provider: 'google' | 'github') => {
    socialLogin(provider);
  };

  const isLoading = form.formState.isSubmitting;

  return (
    <div className='flex justify-center items-center h-screen'>
      <Form {...form}>
        <form
          onChange={() => submitError && setSubmitError('')}
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
              Maebrie Co.
            </span>
          </Link>

          <FormDescription className="text-foreground/60 text-lg font-semibold">
            realtime Collaboration and Productivity Platform
          </FormDescription>

          {!confirmation && !codeExchangeError && (
            <>
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
                    <FormControl>
                      <Input type="password" placeholder="Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="password" placeholder="Confirm Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full p-6" disabled={isLoading}>
                {isLoading ? <Loader isAuth={true} /> : 'Create Account'}
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
            </>
          )}

          {submitError && <FormMessage>{submitError}</FormMessage>}

          <span className="self-container">
            Already have an account?{' '}
            <Link href="/login" className="text-primary">Login</Link>
          </span>

          {(confirmation || codeExchangeError) && (
            <Alert className={clsx('dark:bg-primary/10 dark:text-gray-400 dark:border-primary/50', {
              'bg-red-500/10 border-red-500/50 text-red-700': codeExchangeError,
            })}>
              {!codeExchangeError && <MailCheck className="h-4 w-4" />}
              <AlertTitle className="text-center text-foreground dark:text-gray-400 dark:border-primary/50">
                {codeExchangeError ? 'Invalid Link' : 'Check your email.'}
              </AlertTitle>
              <AlertDescription className="text-center text-foreground dark:text-gray-400 dark:border-primary/50">
                {codeExchangeError || 'An email confirmation has been sent.'}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </Form>
    </div>
  );
};

export default Signup;
