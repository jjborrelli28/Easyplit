"use client";

import { useMemo, useState } from "react";

import Image from "next/image";

import type { Session } from "next-auth";

import clsx from "clsx";
import debounce from "lodash.debounce";
import { UserRoundSearch } from "lucide-react";

import useSearchUsers from "@/hooks/users/useSearchUsers";

import type { User } from "@/lib/api/types";

import Input, { type InputProps } from "../Input";
import InputErrorMessage from "../InputErrorMessage";

export interface UserSearchEngineProps
  extends Omit<InputProps, "value" | "onSelect"> {
  user?: Session["user"];
  onSelect: (user: User) => void;
  onChange?: VoidFunction;
  onFocus?: VoidFunction;
  onBlur?: VoidFunction;
  excludeUserIds?: string[];
}

const UserSearchEngine = ({
  user,
  onSelect,
  onChange,
  onFocus,
  onBlur,
  label,
  placeholder = "Buscar por nombre o email",
  excludeUserIds = [],
}: UserSearchEngineProps) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const effectiveExcludedIds = useMemo(() => {
    const ids = new Set<string>(excludeUserIds);

    if (user?.id) ids.add(user.id);

    return Array.from(ids);
  }, [excludeUserIds, user?.id]);

  const {
    data: users = [],
    error,
    isFetched,
  } = useSearchUsers(debouncedQuery, effectiveExcludedIds);

  const debouncedUpdate = useMemo(
    () => debounce((val: string) => setDebouncedQuery(val), 300),
    [],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setHighlightedIndex(-1);
    debouncedUpdate(e.target.value);
    onChange?.();
  };

  const handleSelect = (user: User) => {
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

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <div className="relative w-full max-w-md">
      <Input
        label={label}
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        error={
          isFetched && users.length === 0 && !error
            ? "No se encontraron resultados para su busqueda"
            : null
        }
        errorClassName="text-warning"
      />

      <div className="bg-background pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 pl-3">
        <UserRoundSearch
          className={clsx(
            "text-foreground h-5.5 w-5.5 transition-colors duration-300",
            isFocused && "text-primary",
          )}
        />
      </div>

      {users.length > 0 && (
        <ul className="bg-h-background border-primary absolute top-full right-0 left-0 z-20 max-h-60 overflow-y-auto border !border-t-0 shadow-xl">
          {users.map((user, i) => (
            <li
              key={user.id}
              onMouseDown={() => handleSelect(user)}
              className={clsx(
                "hover:bg-primary hover:text-background group flex cursor-pointer gap-x-4 p-4 transition-colors duration-300",
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
                  className="h-12 w-12 rounded-full transition-colors duration-300"
                />
              )}

              <div
                className={clsx(
                  "group-hover:bg-background h-12 w-[1px] transition-colors duration-300",
                  highlightedIndex === i ? "bg-background" : "bg-foreground",
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

      <InputErrorMessage message={error?.response?.data.error.message} />
    </div>
  );
};

export default UserSearchEngine;
