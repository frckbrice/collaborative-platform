import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { workspace, Folder, File } from '@/lib/supabase/supabase.types';

type BreadcrumbItem = {
  title: string;
  href?: string;
  isActive?: boolean;
};

type Props = {
  // For workspace pages
  workspace?: workspace | null;
  // For folder pages
  folder?: Folder | null;
  // For file pages
  file?: File | null;
  // Custom breadcrumb items (overrides default behavior)
  breadcrumbs?: BreadcrumbItem[];
  // Custom back button behavior
  backHref?: string;
  backLabel?: string;
  // Page type for default breadcrumb generation
  pageType?: 'workspace' | 'folder' | 'file';
};

const QuillHeader = ({
  workspace,
  folder,
  file,
  breadcrumbs,
  backHref = '/dashboard',
  backLabel = 'Dashboard',
  pageType,
}: Props) => {
  // Generate default breadcrumbs based on page type and data
  const getDefaultBreadcrumbs = (): BreadcrumbItem[] => {
    if (breadcrumbs) return breadcrumbs;

    const items: BreadcrumbItem[] = [];

    if (pageType === 'workspace') {
      items.push({
        title: workspace?.title || 'Loading...',
        isActive: true,
      });
    } else if (pageType === 'folder') {
      items.push({
        title: workspace?.title || 'Loading...',
        href: workspace?.id ? `/dashboard/${workspace.id}` : undefined,
      });
      items.push({
        title: folder?.title || 'Loading...',
        isActive: true,
      });
    } else if (pageType === 'file') {
      items.push({
        title: workspace?.title || 'Loading...',
        href: workspace?.id ? `/dashboard/${workspace.id}` : undefined,
      });
      items.push({
        title: folder?.title || 'Loading...',
        href: workspace?.id && folder?.id ? `/dashboard/${workspace.id}/${folder.id}` : undefined,
      });
      items.push({
        title: file?.title || 'Loading...',
        isActive: true,
      });
    }

    return items;
  };

  const defaultBreadcrumbs = getDefaultBreadcrumbs();

  // Always show breadcrumbs, even if data is still loading
  return (
    <div className="sticky top-0 z-40 bg-white/10 backdrop-blur-sm border-b border-gray-200 dark:border-none dark:bg-white/10 shadow-lg dark:shadow-gray-700">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <Button className="dark:bg-white bg-primary" asChild variant="outline">
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4 mr-2 dark:text-black dark:bg-white text-gray-300" />
              <span className="text-gray-300 dark:text-black">{backLabel}</span>
            </Link>
          </Button>

          {/* Breadcrumb navigation - always visible */}
          <span className="text-gray-400 dark:text-muted-foreground">/</span>
          {defaultBreadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              {item.href ? (
                <Link
                  href={item.href}
                  className="font-medium text-gray-900 dark:text-foreground hover:text-primary transition-colors"
                >
                  {item.title}
                </Link>
              ) : (
                <span
                  className={`font-medium ${item.isActive ? 'text-gray-900 dark:text-foreground' : 'text-gray-600 dark:text-muted-foreground'}`}
                >
                  {item.title}
                </span>
              )}
              {index < defaultBreadcrumbs.length - 1 && (
                <span className="text-gray-400 dark:text-muted-foreground">/</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuillHeader;
