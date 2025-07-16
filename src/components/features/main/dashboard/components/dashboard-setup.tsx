'use client';
import { AuthUser } from '@supabase/supabase-js';
import React, { useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { v4 as uuid } from 'uuid';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { EmojiPicker } from '@/components/global-components';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Subscription, workspace } from '@/lib/supabase/supabase.types';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/global-components';
import { createWorkspace } from '@/lib/supabase/queries';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/lib/providers/state-provider';
import { createClient } from '@/utils/client';
import { CreateWorkspaceFormSchema } from '@/lib/type';
import { z } from 'zod';
import { toast } from "sonner";

interface DashboardSetupProps {
  user: AuthUser;
  supabaseSubscription: Subscription | null;
}

const DashboardSetup: React.FC<DashboardSetupProps> = ({ supabaseSubscription, user }) => {
  const router = useRouter();
  const { dispatch } = useAppState();
  const [selectedEmoji, setSelectedEmoji] = useState('💼');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isLoading, errors },
  } = useForm<z.infer<typeof CreateWorkspaceFormSchema>>({
    mode: 'onChange',
    defaultValues: {
      logo: '',
      workspaceName: '',
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof CreateWorkspaceFormSchema>> = async (value) => {
    if (!supabase) {
      toast.error('Supabase client not available');
      return;
    }
    const file = value.logo?.[0];
    let filePath = null;
    const workspaceUUID = uuid();
    setUploadError(null);

    console.log('Uploading file:', file);

    if (file) {
      try {
        console.log('Attempting to upload to workspace-logos bucket...');

        // Check if user is authenticated
        if (!user) {
          console.error('No authenticated user found');
          setUploadError('Please log in to upload files.');
          toast.error('Please log in to upload files.');
          return;
        }

        console.log('User authenticated:', user.email);

        // Check if bucket exists by trying to access it directly
        const { data: bucketTest, error: bucketError } = await supabase.storage
          .from('workspace-logos')
          .list();

        if (bucketError) {
          console.error('Error accessing workspace-logos bucket:', bucketError);
          setUploadError('Storage bucket not accessible. Please check your Supabase setup.');
          toast.error('Storage bucket not accessible. Please check your Supabase setup.');
          return;
        }


        const { data, error } = await supabase.storage
          .from('workspace-logos')
          .upload(`workspaceLogo.${workspaceUUID}`, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (error) {
          console.error('Storage upload error:', error);

          // Provide more specific error messages
          if (error.message.includes('row-level security policy')) {
            setUploadError('Upload failed: Storage policy issue. Please contact support.');
            toast.error('Upload failed: Storage policy issue. Please contact support.');
          } else {
            setUploadError(`Upload failed: ${error.message}`);
            toast.error(`Upload failed: ${error.message}`);
          }
          return;
        }

        filePath = data.path;
        console.log('File uploaded successfully:', filePath);
        toast.success('Logo uploaded successfully');
      } catch (error) {
        console.error('Upload error:', error);
        setUploadError('Failed to upload logo. Please try again.');
        toast.error('Failed to upload logo. Please try again.');
        return;
      }
    }

    try {
      const newWorkspace: workspace = {
        data: '',
        created_at: new Date().toISOString(),
        icon_id: selectedEmoji,
        id: workspaceUUID,
        in_trash: '',
        title: value.workspaceName,
        workspaces_owner: user.id,
        logo: filePath || null,
        banner_url: '',
      };

      console.log('Creating workspace:', newWorkspace);
      const { data, error: createError } = await createWorkspace(newWorkspace);

      if (createError) {
        console.error('Workspace creation error:', createError);
        throw new Error(createError);
      }

      dispatch({
        type: 'ADD_WORKSPACE',
        payload: { ...newWorkspace, folders: [] },
      });

      toast.success('Workspace Created Successfully');
      router.replace(`/dashboard/${newWorkspace.id}`);
    } catch (error) {
      console.error('Workspace creation error:', error);
      toast.error('Could not create your workspace. Please try again.');
    } finally {
      reset();
      setUploadError(null);
    }
  };

  return (
    <Card
      className="w-[800px] h-screen sm:h-auto bg-white border border-gray-200 shadow-xl dark:bg-card dark:border-none"
    >
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-foreground">Create A Workspace</CardTitle>
        <CardDescription className="text-gray-500 dark:text-muted-foreground">
          Lets create a private workspace to get you started.You can add collaborators later from
          the workspace settings tab.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <div
              className="flex
            items-center
            gap-4"
            >
              <div className="text-5xl">
                <EmojiPicker getValue={(emoji) => setSelectedEmoji(emoji)}>
                  {selectedEmoji}
                </EmojiPicker>
              </div>
              <div className="w-full ">
                <Label
                  htmlFor="workspaceName"
                  className="text-sm
                  text-muted-foreground
                "
                >
                  Name
                </Label>
                <Input
                  id="workspaceName"
                  type="text"
                  placeholder="Workspace Name"
                  disabled={isLoading}
                  {...register('workspaceName', {
                    required: 'Workspace name is required',
                  })}
                />
                <small className="text-red-600">{errors?.workspaceName?.message?.toString()}</small>
              </div>
            </div>
            <div>
              <Label
                htmlFor="logo"
                className="text-sm
                  text-muted-foreground
                "
              >
                Workspace Logo
              </Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                placeholder="Workspace Name"
                disabled={isLoading}
                {...register('logo', {
                  required: false,
                })}
              />
              <small className="text-red-600">{errors?.logo?.message?.toString()}</small>
              {uploadError && (
                <small className="text-red-600 block mt-1">
                  {uploadError}
                  {uploadError.includes('Storage bucket not accessible') && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <p className="font-medium text-yellow-800">Setup Required:</p>
                      <p className="text-yellow-700">
                        Create the storage buckets in Supabase Studio:
                      </p>
                      <ol className="list-decimal list-inside mt-1 text-xs text-yellow-700">
                        <li>Go to <a href="http://localhost:54323" target="_blank" className="underline">Supabase Studio</a></li>
                        <li>Navigate to Storage → Buckets</li>
                        <li>Create buckets: workspace-logos, profile-pictures, file-banners</li>
                      </ol>
                    </div>
                  )}
                </small>
              )}
              {supabaseSubscription?.status !== 'active' && (
                <small
                  className="
                  text-muted-foreground
                  block
              "
                >
                  To customize your workspace, you need to be on a Pro Plan
                </small>
              )}
            </div>
            <div className="self-end">
              <Button disabled={isLoading} type="submit">
                {!isLoading ? 'Create Workspace' : <Loader />}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DashboardSetup;
