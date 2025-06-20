"use client";

import { useMemo, useState } from "react";

import Image from "next/image";

import { useSession } from "next-auth/react";

import clsx from "clsx";
import debounce from "lodash.debounce";
import { Search } from "lucide-react";

import { useSearchUsers } from "@/hooks/users/useSearchUsers";

import type { UserData } from "@/lib/api/types";

import Input from "../Input";

interface UserSearchEngineProps {
  onSelect: (user: UserData) => void;
  placeholder?: string;
  excludeUserIds?: string[];
}

const UserSearchEngine = ({
  placeholder = "Buscar por nombre o email",
  onSelect,
  excludeUserIds = [],
}: UserSearchEngineProps) => {
  const { data } = useSession();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const effectiveExcludedIds = useMemo(() => {
    const ids = new Set<string>(excludeUserIds);

    if (data?.user.id) ids.add(data.user.id);

    return Array.from(ids);
  }, [excludeUserIds, data?.user.id]);

  const { data: users = [] } = useSearchUsers(
    debouncedQuery,
    effectiveExcludedIds,
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    debouncedUpdate(e.target.value);
  };

  const handleSelect = (user: UserData) => {
    onSelect(user);
    setQuery("");
    setDebouncedQuery("");
  };

  const debouncedUpdate = useMemo(
    () => debounce((val: string) => setDebouncedQuery(val), 300),
    [],
  );

  return (
    <div className="relative w-full max-w-md">
      <Input
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      <Search
        className={clsx(
          "text-foreground/50 pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transition-colors duration-300",
          isFocused && "text-primary",
        )}
      />

      {users.length > 0 && (
        <ul className="bg-h-background border-background absolute top-full right-0 left-0 z-10 max-h-60 overflow-y-auto border !border-t-0 shadow-xl">
          {users.map((user, i) => (
            <li
              key={user.id}
              onClick={() => handleSelect(user)}
              className={clsx(
                "hover:bg-primary hover:text-background group flex cursor-pointer gap-x-4 p-4 transition-colors duration-300",
                i % 2 === 0 ? "bg-background/50" : "bg-h-background",
              )}
            >
              {user.image && (
                <Image
                  alt={`${user.name}'s avatar`}
                  src={user.image}
                  height={40}
                  width={40}
                  className="border-foreground group-hover:border-background h-12 w-12 rounded-full border-2 transition-colors duration-300"
                />
              )}

              <div className="group-hover:bg-background bg-foreground h-12 w-[1px] transition-colors duration-300" />

              <div className="flex w-full flex-col justify-center overflow-hidden">
                <p className="truncate font-semibold">{user.name}</p>

                <p className="truncate text-sm">{user.email}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserSearchEngine;
