-- Migration: Ensure files table matches Drizzle schema

-- Add missing columns if they don't exist
ALTER TABLE files ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() PRIMARY KEY;
ALTER TABLE files ADD COLUMN IF NOT EXISTS created_at timestamp with time zone NOT NULL DEFAULT now();
ALTER TABLE files ADD COLUMN IF NOT EXISTS title text NOT NULL;
ALTER TABLE files ADD COLUMN IF NOT EXISTS icon_id text NOT NULL;
ALTER TABLE files ADD COLUMN IF NOT EXISTS data text NOT NULL;
ALTER TABLE files ADD COLUMN IF NOT EXISTS in_trash text;
ALTER TABLE files ADD COLUMN IF NOT EXISTS banner_url text;
ALTER TABLE files ADD COLUMN IF NOT EXISTS folder_id uuid NOT NULL;
ALTER TABLE files ADD COLUMN IF NOT EXISTS workspace_id uuid NOT NULL;

-- Set NOT NULL constraints
ALTER TABLE files ALTER COLUMN id SET NOT NULL;
ALTER TABLE files ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE files ALTER COLUMN title SET NOT NULL;
ALTER TABLE files ALTER COLUMN icon_id SET NOT NULL;
ALTER TABLE files ALTER COLUMN data SET NOT NULL;
ALTER TABLE files ALTER COLUMN folder_id SET NOT NULL;
ALTER TABLE files ALTER COLUMN workspace_id SET NOT NULL;

-- Set defaults
ALTER TABLE files ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE files ALTER COLUMN created_at SET DEFAULT now();

-- Add or update foreign key constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'files_folder_id_folders_id_fk'
      AND table_name = 'files'
  ) THEN
    ALTER TABLE files
      ADD CONSTRAINT files_folder_id_folders_id_fk
      FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'files_workspace_id_workspaces_id_fk'
      AND table_name = 'files'
  ) THEN
    ALTER TABLE files
      ADD CONSTRAINT files_workspace_id_workspaces_id_fk
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;
END$$; 