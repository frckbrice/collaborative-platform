'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { UploadBannerFormSchema } from '@/lib/type';
import { createClient } from '@/utils/client';
import React, { memo } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/global-components';
import { updateFile, updateFolder, updateWorkspace } from '@/lib/supabase/queries';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { revalidatePath } from 'next/cache';

interface BannerUploadFormProps {
  dirType: 'workspace' | 'file' | 'folder';
  id: string;
}

const BannerUploadForm = memo(({ dirType, id }: BannerUploadFormProps) => {
  const supabase = createClient();
  const { state, workspaceId, folderId, dispatch } = useAppState();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isUploading, errors },
  } = useForm<z.infer<typeof UploadBannerFormSchema>>({
    mode: 'onChange',
    defaultValues: {
      banner: '',
    },
  });

  const onSubmitHandler: SubmitHandler<z.infer<typeof UploadBannerFormSchema>> = async (values) => {
    if (!supabase) {
      toast.error('Supabase client not available');
      return;
    }
    const file = values.banner?.[0];
    if (!file || !id) {
      toast.error('Please select a banner image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    try {
      let filePath = null;

      const uploadBanner = async () => {
        const { data, error } = await supabase.storage
          .from('file-banners')
          .upload(`banner-${id}`, file, { cacheControl: '5', upsert: true });

        if (error) {
          console.error('Upload error:', error);
          toast.error('Failed to upload banner');
          throw error;
        }
        filePath = data?.path;
      };

      await uploadBanner();

      if (dirType === 'file') {
        if (!workspaceId || !folderId) {
          toast.error('Missing workspace or folder information');
          return;
        }
        dispatch({
          type: 'UPDATE_FILE',
          payload: {
            file: { banner_url: filePath },
            fileId: id,
            folderId,
            workspaceId,
          },
        });
        await updateFile({ banner_url: filePath }, id);
      } else if (dirType === 'folder') {
        if (!workspaceId) {
          toast.error('Missing workspace information');
          return;
        }
        dispatch({
          type: 'UPDATE_FOLDER',
          payload: {
            folderId: id,
            folder: { banner_url: filePath },
            workspaceId,
          },
        });
        await updateFolder({ banner_url: filePath }, id);
      } else if (dirType === 'workspace') {
        if (!workspaceId) {
          toast.error('Missing workspace information');
          return;
        }
        dispatch({
          type: 'UPDATE_WORKSPACE',
          payload: {
            workspace: { banner_url: filePath },
            workspaceId,
          },
        });
        await updateWorkspace({ banner_url: filePath }, id);
      }

      // Remove the problematic router calls that cause infinite loops
      // const currentPath = window.location.pathname;
      // router.refresh();

      // Also revalidate the workspace path if we're in a workspace
      // if (dirType === 'workspace' && workspaceId) {
      //   router.push(`/dashboard/${workspaceId}`);
      // }

      toast.success('Banner uploaded successfully!');
      reset();
    } catch (error) {
      console.error('Banner upload error:', error);
      toast.error('Failed to upload banner. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground" htmlFor="bannerImage">
          Banner Image
        </Label>
        <Input
          id="bannerImage"
          type="file"
          accept="image/*"
          disabled={isUploading}
          className="cursor-pointer"
          {...register('banner', {
            required: 'Banner Image is required',
            validate: (value) => {
              if (!value || value.length === 0) return 'Please select a file';
              const file = value[0];
              if (file.size > 5 * 1024 * 1024) return 'File size must be less than 5MB';
              if (!file.type.startsWith('image/')) return 'Please select a valid image file';
              return true;
            }
          })}
        />
        {errors.banner && (
          <small className="text-destructive text-sm">{errors.banner.message?.toString()}</small>
        )}
        <p className="text-xs text-muted-foreground">
          Supported formats: JPG, PNG, GIF. Max size: 5MB
        </p>
      </div>

      <Button
        disabled={isUploading}
        type="submit"
        className="w-full"
      >
        {!isUploading ? 'Upload Banner' : <Loader />}
      </Button>
    </form>
  );
});

BannerUploadForm.displayName = "BannerUploadForm";

export default BannerUploadForm;
