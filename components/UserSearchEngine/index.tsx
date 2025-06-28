"use client";

import { useMemo, useState } from "react";

import Image from "next/image";

import { useSession } from "next-auth/react";

import clsx from "clsx";
import debounce from "lodash.debounce";
import { Search } from "lucide-react";

import useSearchUsers from "@/hooks/users/useSearchUsers";

import type { UserData } from "@/lib/api/types";

import Input from "../Input";
import Collapse from "../Collapse";

interface UserSearchEngineProps {
  onSelect: (user: UserData) => void;
  placeholder?: string;
  excludeUserIds?: string[];
  error?: string | null;
}

const UserSearchEngine = ({
  placeholder = "Buscar por nombre o email",
  onSelect,
  excludeUserIds = [],
  error,
}: UserSearchEngineProps) => {
  const { data } = useSession();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const effectiveExcludedIds = useMemo(() => {
    const ids = new Set<string>(excludeUserIds);

    if (data?.user.id) ids.add(data.user.id);

    return Array.from(ids);
  }, [excludeUserIds, data?.user.id]);

  const { data: users = [] } = useSearchUsers(
    debouncedQuery,
    effectiveExcludedIds,
  );

  const debouncedUpdate = useMemo(
    () => debounce((val: string) => setDebouncedQuery(val), 300),
    [],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setHighlightedIndex(-1);
    debouncedUpdate(e.target.value);
  };

  const handleSelect = (user: UserData) => {
    onSelect(user);
    setQuery("");
    setDebouncedQuery("");
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!users.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();

      setHighlightedIndex((prev) => (prev < users.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();

      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : users.length - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();

      handleSelect(users[highlightedIndex]);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <Input
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
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
              onMouseDown={() => handleSelect(user)}
              className={clsx(
                "group flex cursor-pointer gap-x-4 p-4 transition-colors duration-300",
                highlightedIndex === i
                  ? "bg-primary text-background"
                  : i % 2 === 0
                    ? "bg-background/50"
                    : "bg-h-background",
              )}
            >
              {user.image && (
                <Image
                  alt={`${user.name}'s avatar`}
                  src={user.image}
                  height={40}
                  width={40}
                  className={clsx(
                    "h-12 w-12 rounded-full border-2 transition-colors duration-300",
                    highlightedIndex === i
                      ? "border-background"
                      : "border-foreground group-hover:border-background",
                  )}
                />
              )}

              <div
                className={clsx(
                  "h-12 w-[1px] transition-colors duration-300",
                  highlightedIndex === i
                    ? "bg-background"
                    : "bg-foreground group-hover:bg-background",
                )}
              />

              <div className="flex w-full flex-col justify-center overflow-hidden">
                <p className="truncate font-semibold">{user.name}</p>

                <p className="truncate text-sm">{user.email}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Collapse isOpen={!!error}>
        <p className="text-danger mt-1 ml-1 text-start text-xs">{error}</p>
      </Collapse>
    </div>
  );
};

export default UserSearchEngine;
