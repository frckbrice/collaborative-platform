import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { AlertCircle } from 'lucide-react';
import { Button } from './button';
import Link from 'next/link';

interface ErrorCardProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: React.ReactNode;
}

const ErrorCard: React.FC<ErrorCardProps> = ({
  title,
  description,
  actionHref = '/dashboard',
  actionLabel = 'Go to Dashboard',
  icon,
}) => (
  <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          {icon || <AlertCircle className="h-6 w-6 text-destructive" />}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild className="w-full">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default ErrorCard;
