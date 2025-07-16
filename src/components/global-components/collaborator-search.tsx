'use client';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { User } from '@/lib/supabase/supabase.types';
import React, { useEffect, useRef, useState, memo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { getUsersFromSearch, findUser } from '@/lib/supabase/queries';
import { isUuid } from '@/lib/utils';

interface CollaboratorSearchProps {
  existingCollaborators: User[] | [];
  getCollaborator: (collaborator: User) => void;
  children: React.ReactNode;
}

const CollaboratorSearch: React.FC<CollaboratorSearchProps> = memo(
  ({ children, existingCollaborators, getCollaborator }) => {
    const { user } = useSupabaseUser();
    const [searchResults, setSearchResults] = useState<User[] | []>([]);
    const timerRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);

    const getUserData = () => { };

    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (timerRef) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        let users: User[] = [];
        const value = e.target.value;
        if (isUuid(value)) {
          // If input is a UUID, search by id
          const user = await findUser(value);
          if (user) users = [user];
        } else {
          const res = await getUsersFromSearch(value);
          if (Array.isArray(res)) {
            users = res;
          } else if (res && Array.isArray(res.data)) {
            users = res.data;
          }
        }

        console.log("\n\n collaborator search users", users);
        setSearchResults(users);
      }, 450);
    };

    const addCollaborator = (user: User) => {
      getCollaborator(user);
    };

    return (
      <div>
        <Sheet>
          {/* If children is a <Button>, wrap it in a <span> to avoid nested <button> */}
          <SheetTrigger className="w-full">
            <span className="w-full block">{children}</span>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Search Collaborator</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                You can also remove collaborators after adding them from the settings tab.
              </SheetDescription>
            </SheetHeader>
            <div
              className="flex justify-center
          items-center
          gap-2
          mt-2
        "
            >
              <Search />
              <Input
                name="name"
                className="dark:bg-background"
                placeholder="Email"
                onChange={onChangeHandler}
              />
            </div>
            <ScrollArea
              className="mt-6
          overflow-y-scroll
          w-full
          rounded-md
        "
            >
              {searchResults
                .filter(
                  (result) => !existingCollaborators.some((existing) => existing.id === result.id)
                )
                .filter((result) => result.id !== user?.id)
                .map((user) => (
                  <div key={user.id} className=" p-4 flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="/avatars/avatar-ing.webp" />
                        <AvatarFallback>CP</AvatarFallback>
                      </Avatar>
                      <div
                        className="text-sm 
                  gap-2 
                  overflow-hidden 
                  overflow-ellipsis 
                  w-[180px] 
                  text-muted-foreground
                  "
                      >
                        {user.email}
                      </div>
                    </div>
                    <Button onClick={() => addCollaborator(user)}>
                      Add
                    </Button>
                  </div>
                ))}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    );
  }
);

CollaboratorSearch.displayName = "CollaboratorSearch";

export default CollaboratorSearch;
