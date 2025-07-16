import { Socket, Server as NetServer } from 'net';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';
import { z } from 'zod';

export const FormSchema = z.object({
  email: z
    .string()
    .describe('Email')
    .min(1, { message: 'Email is required' })
    .email({ message: 'Email is invalid' }),
  password: z
    .string()
    .describe('Password')
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password is required and must be more than 8 characters' }),
});

export const CreateWorkspaceFormSchema = z.object({
  workspaceName: z
    .string()
    .describe('Workspace Name')
    .min(1, 'Workspace name must be min of 1 character'),
  logo: z.any(),
});

export const UploadBannerFormSchema = z.object({
  banner: z.any().describe('Banner Image'),
});

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};
