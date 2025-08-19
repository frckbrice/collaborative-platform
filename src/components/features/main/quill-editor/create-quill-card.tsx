import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const CreateQuillCard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">No Workspaces Found</CardTitle>
          <CardDescription>
            You don&apos;t have any workspaces yet. Create your first workspace to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/dashboard">
              <Plus className="mr-2 h-4 w-4" />
              Create Workspace
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateQuillCard;
