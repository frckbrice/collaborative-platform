'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useAppState } from '@/lib/providers/state-provider';
import { User, workspace } from '@/lib/supabase/supabase.types';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/client';
import {
  Briefcase,
  CreditCard,
  ExternalLink,
  Lock,
  LogOut,
  Plus,
  Share,
  User as UserIcon,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  addCollaborators,
  deleteWorkspace,
  getCollaborators,
  removeCollaborators,
  updateUser,
  updateWorkspace,
} from '@/lib/supabase/queries';
import { isUuid } from '@/lib/utils';
import { uuid as v4 } from 'uuidv4';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { CollaboratorSearch } from '@/components/global-components';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CypressProfileIcon from '../../icons/cypressProfileIcon';
import { LogoutButton } from '../../global-components';
import Link from 'next/link';
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';
import { postData } from '@/lib/utils';

export default function SettingsForm() {
  const { user, subscription } = useSupabaseUser();
  const { open, setOpen } = useSubscriptionModal();
  const router = useRouter();
  const supabase = createClient();
  const { state, workspaceId, dispatch } = useAppState();
  const [permissions, setPermissions] = useState('private');
  const [collaborators, setCollaborators] = useState<User[] | []>([]);
  const [openAlertMessage, setOpenAlertMessage] = useState(false);
  const [workspaceDetails, setWorkspaceDetails] = useState<workspace>();
  const titleTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

  //WIP PAYMENT PORTAL

  const redirectToCustomerPortal = async () => {
    setLoadingPortal(true);
    try {
      const { url, error } = await postData({
        url: '/api/create-portal-link',
      });
      window.location.assign(url);
    } catch (error) {
      console.log(error);
      setLoadingPortal(false);
    }
    setLoadingPortal(false);
  };

  //addcollborators
  const addCollaborator = async (profile: User) => {
    if (!workspaceId || !isUuid(workspaceId)) {
      console.log('for setting workspace id not found');
      return;
    }
    if (subscription?.status !== 'active' && collaborators.length >= 2) {
      setOpen(true);
      return;
    }
    // Prevent duplicate collaborators
    if (collaborators.some((c) => c.id === profile.id)) {
      toast.error('Collaborator already added');
      return;
    }
    try {
      await addCollaborators([profile], workspaceId);
      // Always fetch the latest list after adding
      const updated = await getCollaborators(workspaceId);
      if (updated.error) {
        console.error('Error fetching collaborators:', updated.error);
        toast.error('Failed to refresh collaborator list');
        return;
      }
      setCollaborators(updated.data || []);
      toast.success('Successfully added collaborator');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add collaborator');
    }
  };

  console.log('collaborators', collaborators);

  //remove collaborators
  const removeCollaborator = async (user: User) => {
    if (!workspaceId) {
      console.log('workspace id not found');
      return;
    }
    if (collaborators.length === 1) {
      setPermissions('private');
    }

    try {
      await removeCollaborators([user], workspaceId);
      setCollaborators(collaborators.filter((collaborator) => collaborator.email !== user?.id));
      toast.success('Successfully removed collaborator');
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove collaborator');
    }
    router.refresh();
  };

  //on change

  const workspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId || !isUuid(workspaceId) || !e.target.value) {
      toast.error('invalide workspace id  or no workspace name');
      return;
    }
    try {
      dispatch({
        type: 'UPDATE_WORKSPACE',
        payload: { workspace: { title: e.target.value }, workspaceId },
      });
      if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
      titleTimerRef.current = setTimeout(async () => {
        await updateWorkspace({ title: e.target.value }, workspaceId);
        toast.success('Successfully updated workspace name');
      }, 500);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update collaborator');
    }
  };

  const onChangeWorkspaceLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId || !isUuid(workspaceId)) {
      toast.error('invalide workspace id');
      return;
    }
    if (!supabase) {
      toast.error('Supabase client not available');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) {
      toast.error('No file selected');
      return;
    }
    /*
         // Check if the file already exists in the bucket
    const { data, error } = await supabase.storage
      .from(workspace-logos)
      .list({ prefix: fileName });

    if (data && data.length > 0) {
      // File exists, remove it first
      await supabase.storage
        .from(workspace-logos)
        .remove([`${fileName}`]);
    }

    // Upload the new file
    const { data, error } = await supabase.storage
      .from(workspace-logos)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

        */
    const uuid = v4();
    setUploadingLogo(true);
    try {
      const { data, error } = await supabase!.storage
        .from('workspace-logos')
        .upload(`workspaceLogo.${uuid}`, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error) {
        dispatch({
          type: 'UPDATE_WORKSPACE',
          payload: { workspace: { logo: data.path }, workspaceId },
        });
        await updateWorkspace({ logo: data.path }, workspaceId);
        setUploadingLogo(false);
        toast.success('Successfully updated workspace logo');
      }
    } catch (error) {
      toast.error('Failed to update workspace logo');
      setUploadingLogo(false);
    }
  };

  const onClickAlertConfirm = async () => {
    if (!workspaceId) return;
    if (collaborators.length > 0) {
      await removeCollaborators(collaborators, workspaceId);
    }
    setPermissions('private');
    setOpenAlertMessage(false);
  };

  const onPermissionsChange = (val: string) => {
    if (val === 'private') {
      setOpenAlertMessage(true);
    } else setPermissions(val);
  };

  //CHALLENGE fetching avatar details
  const onChangeProfilePicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!supabase) {
      toast.error('Supabase client not available');
      return;
    }
    if (!user?.id) {
      toast.error('User not found');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) {
      toast.error('No file selected');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const uuid = v4();
    setUploadingProfilePic(true);
    try {
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(`profilePicture.${uuid}`, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.error('Storage upload error:', error);
        toast.error(`Failed to upload image: ${error.message}`);
        setUploadingProfilePic(false);
        return;
      }

      if (data) {
        // Get the public URL for the uploaded image
        const { data: urlData } = supabase.storage.from('profile-pictures').getPublicUrl(data.path);

        dispatch({
          type: 'UPDATE_USER',
          payload: { user: { avatar_url: data.path }, userId: user.id },
        });

        const updateResult = await updateUser({ avatar_url: data.path }, user.id);
        if (updateResult?.error) {
          console.error('User update error:', updateResult.error);
          toast.error('Failed to update user profile');
        } else {
          toast.success('Successfully updated profile picture');
        }
      } else {
        toast.error('Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setUploadingProfilePic(false);
    }
  };
  //WIP Payment Portal redirect

  useEffect(() => {
    const showingWorkspace = state.workspaces.find((workspace) => workspace.id === workspaceId);
    if (showingWorkspace) setWorkspaceDetails(showingWorkspace);
  }, [workspaceId, state]);

  useEffect(() => {
    if (!workspaceId) {
      console.log('workspace id not found');
      return;
    }
    const fetchCollaborators = async () => {
      const response = await getCollaborators(workspaceId);
      if (response.error) {
        console.error('Error fetching collaborators:', response.error);
        return;
      }
      if (response.data && response.data.length > 0) {
        setPermissions('shared');
        setCollaborators(response.data);
      } else {
        setCollaborators([]);
      }
    };
    fetchCollaborators();
  }, [workspaceId]);

  return (
    <div className="flex gap-4 flex-col">
      <p className="flex items-center gap-2 mt-6 text-lg font-bold">
        <Briefcase size={20} />
        Workspace Settings
      </p>
      <Separator />
      <div className="flex flex-col gap-2">
        <Label htmlFor="workspaceName" className="text-sm text-muted-foreground">
          Name
        </Label>
        <Input
          name="workspaceName"
          // value={workspaceDetails ? workspaceDetails.title : ''}
          value={workspaceDetails?.title ?? ''}
          placeholder="Workspace Name"
          onChange={workspaceNameChange}
          className=" bg-green-300"
        />
        <Label htmlFor="workspaceLogo" className="text-sm text-muted-foreground">
          Workspace Logo
        </Label>
        <Input
          className=" border-gray-400 border-2"
          name="workspaceLogo"
          type="file"
          accept="image/*"
          placeholder="Workspace Logo"
          onChange={onChangeWorkspaceLogo}
          disabled={uploadingLogo || subscription?.status !== 'active'}
        />
        {subscription?.status !== 'active' && (
          <small className="text-muted-foreground">
            To customize your workspace, you need to be on a Pro Plan
          </small>
        )}
      </div>
      <>
        <Label htmlFor="permissions">Permissions</Label>
        <Select onValueChange={onPermissionsChange} value={permissions}>
          <SelectTrigger className="w-full h-26 -mt-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="private">
                <div
                  className="p-2
                  flex
                  gap-4
                  justify-center
                  items-center
                "
                >
                  <Lock />
                  <article className="text-left flex flex-col">
                    <span>Private</span>
                    <p>Your workspace is private to you. You can choose to share it later.</p>
                  </article>
                </div>
              </SelectItem>
              <SelectItem value="shared">
                <div className="p-2 flex gap-4 justify-center items-center">
                  <Share></Share>
                  <article className="text-left flex flex-col">
                    <span>Shared: </span>
                    <span>You can invite collaborators.</span>
                  </article>
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {permissions === 'shared' && (
          <div>
            <CollaboratorSearch
              existingCollaborators={collaborators}
              getCollaborator={(user) => {
                addCollaborator(user);
              }}
            >
              <Button type="button" className="text-sm mt-4">
                <Plus />
                Add Collaborators
              </Button>
            </CollaboratorSearch>
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">
                Collaborators {collaborators?.filter((c) => c.email !== user?.email)?.length || ''}
              </span>
              <ScrollArea
                className="
            h-[120px]
            overflow-y-scroll
            w-full
            rounded-md
            border
            border-muted-foreground/20"
              >
                {collaborators?.filter((c) => c.email !== user?.email)?.length ? (
                  // remove current user from collaborators
                  collaborators
                    ?.filter((c) => c.email !== user?.email)
                    ?.map((c) => {
                      return (
                        <div
                          className="p-4 flex
                        justify-between
                        items-center
                  "
                          key={c.id}
                        >
                          <div className="flex gap-4 items-center">
                            <Avatar>
                              <AvatarImage src="/avatars/avatar-ing.webp" />
                              <AvatarFallback>PJ</AvatarFallback>
                            </Avatar>
                            <div
                              className="text-sm 
                            gap-2
                            text-muted-foreground
                            overflow-hidden
                            overflow-ellipsis
                            sm:w-[300px]
                            w-[140px]
                          "
                            >
                              {c.email}
                            </div>
                          </div>
                          <Button
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-3"
                            onClick={() => removeCollaborator(c)}
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })
                ) : (
                  <div
                    className="absolute
                  right-0 left-0
                  top-0
                  bottom-0
                  flex
                  justify-center
                  items-center
                "
                  >
                    <span className="text-muted-foreground text-sm">You have no collaborators</span>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
        <Alert variant={'destructive'}>
          <AlertDescription>
            Warning! deleting your workspace will permanantly delete all data related to this
            workspace.
          </AlertDescription>
          <Button
            type="submit"
            className="mt-4 text-sm bg-destructive/40 border-2 border-destructive h-9 rounded-md px-3"
            onClick={async () => {
              if (!workspaceId) return;
              await deleteWorkspace(workspaceId);
              toast.success('Successfully deleted your workspae');
              dispatch({ type: 'DELETE_WORKSPACE', payload: workspaceId });
              router.replace('/dashboard');
            }}
          >
            Delete Workspace
          </Button>
        </Alert>
        <p className="flex items-center gap-2 mt-6">
          <UserIcon size={20} /> Profile
        </p>
        <Separator />
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src={''} />
            <AvatarFallback>
              <CypressProfileIcon />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col ml-6">
            <small className="text-muted-foreground cursor-not-allowed">
              {user ? user.email : ''}
            </small>
            <Label htmlFor="profilePicture" className="text-sm text-muted-foreground">
              Profile Picture
            </Label>
            <Input
              name="profilePicture"
              type="file"
              accept="image/*"
              placeholder="Profile Picture"
              onChange={onChangeProfilePicture}
              disabled={uploadingProfilePic}
            />
          </div>
        </div>

        {/* Password Reset Section */}
        <div className="mt-4">
          <Label className="text-sm text-muted-foreground">Password</Label>
          <Button
            type="button"
            className="text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-3 mt-2"
            onClick={async () => {
              if (!user?.email) {
                toast.error('No email found for password reset');
                return;
              }
              try {
                const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                  redirectTo: `${window.location.origin}/reset-password`,
                });
                if (error) {
                  toast.error('Failed to send password reset email');
                } else {
                  toast.success('Password reset email sent to your email address');
                }
              } catch (error) {
                toast.error('Failed to send password reset email');
              }
            }}
          >
            Reset Password
          </Button>
        </div>

        <LogoutButton
          className="mt-4 w-full border border-input 
          bg-background hover:bg-accent text-accent-foreground h-9 rounded-md px-3"
          showIcon={true}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </LogoutButton>
        <p className="flex items-center gap-2 mt-6">
          <CreditCard size={20} /> Billing & Plan
        </p>
        <Separator />
        <p className="text-muted-foreground">
          You are currently on a {subscription?.status === 'active' ? 'Pro' : 'Free'} Plan
        </p>
        <Link
          href="/"
          target="_blank"
          className="text-muted-foreground flex flex-row items-center gap-2"
        >
          View Plans <ExternalLink size={16} />
        </Link>
        {subscription?.status === 'active' ? (
          <div>
            <Button
              type="button"
              disabled={loadingPortal}
              className="text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-3"
              onClick={redirectToCustomerPortal}
            >
              Manage Subscription
            </Button>
          </div>
        ) : (
          <div>
            <Button
              type="button"
              className="text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-3"
              onClick={() => setOpen(true)}
            >
              Start Plan
            </Button>
          </div>
        )}
      </>
      <AlertDialog open={openAlertMessage}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDescription>
              Changing a Shared workspace to a Private workspace will remove all collaborators
              permanantly.
            </AlertDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenAlertMessage(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onClickAlertConfirm}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
