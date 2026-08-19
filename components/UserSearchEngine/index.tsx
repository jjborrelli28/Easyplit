"use client";

import { useMemo, useState } from "react";

import Image from "next/image";

import type { Session } from "next-auth";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";
import debounce from "lodash.debounce";
import { Mail, UserRoundPlus, UserRoundSearch } from "lucide-react";
import { z } from "zod";

import useSearchUsers from "@/hooks/data/users/useSearchUsers";

import type { User } from "@/lib/api/types";

import Button from "../Button";
import Input, { type InputProps } from "../Input";
import InputErrorMessage from "../InputErrorMessage";
import LoadingBar from "../LoadingBar";

const isEmail = (value: string) => z.string().email().safeParse(value).success;

export interface UserSearchEngineProps
  extends Omit<InputProps, "value" | "onSelect"> {
  user?: Session["user"];
  onSelect: (user: User) => void;
  onChange?: VoidFunction;
  onFocus?: VoidFunction;
  onBlur?: VoidFunction;
  excludeUserIds?: string[];
  excludeUserNames?: (string | null)[];
  allowVirtualUsers?: boolean;
}

const UserSearchEngine = ({
  user: loggedUser,
  onSelect,
  onChange,
  onFocus,
  onBlur,
  label,
  placeholder = "Buscar por nombre o email",
  excludeUserIds = [],
  excludeUserNames = [],
  allowVirtualUsers = false,
}: UserSearchEngineProps) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const {
    data: users = [],
    error,
    isFetched,
    isLoading,
  } = useSearchUsers(debouncedQuery, excludeUserIds);

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

  const isEmailQuery = isEmail(debouncedQuery);

  const generateDraftId = () =>
    `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const handleCreateVirtualUser = () => {
    if (!debouncedQuery || debouncedQuery.length < 2) return;

    const draftUser: User = isEmailQuery
      ? {
          id: generateDraftId(),
          name: debouncedQuery,
          email: debouncedQuery,
          image: null,
          isVirtual: true,
          isDraft: true,
        }
      : {
          id: generateDraftId(),
          name: debouncedQuery,
          email: null,
          image: null,
          isVirtual: true,
          isDraft: true,
        };

    handleSelect(draftUser);
  };

  const showNoResults =
    isFetched && users.length === 0 && !error && debouncedQuery.length >= 2;

  const isDuplicateVirtualUserName = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase();

    return excludeUserNames.some(
      (name) => !!name && name.trim().toLowerCase() === normalizedQuery,
    );
  }, [excludeUserNames, debouncedQuery]);

  const showVirtualUserOption =
    allowVirtualUsers && showNoResults && !isDuplicateVirtualUserName;

  const virtualizer = useWindowVirtualizer({
    count: users.length,
    estimateSize: () => 80,
    overscan: 5,
    enabled: true,
  });

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
        rightItem={
          <div className="bg-background pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 p-3 pt-3.5">
            <UserRoundSearch
              className={clsx(
                "text-foreground h-5.5 w-5.5 transition-colors duration-300",
                isFocused && "text-primary",
              )}
            />
          </div>
        }
        error={
          showNoResults && !allowVirtualUsers
            ? "No se encontraron resultados para su busqueda"
            : null
        }
        errorClassName="text-warning"
      />

      {users.length > 0 && (
        <ul
          className="bg-h-background border-primary absolute top-full right-0 left-0 z-20 max-h-120 overflow-y-auto border !border-t-0 shadow-xl"
          style={{
            height: `${virtualizer.getTotalSize()}px`,
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem, i) => {
            const user = users[virtualItem.index];

            if (!user) return null;

            return (
              <li
                ref={virtualizer.measureElement}
                key={virtualItem.key}
                data-index={virtualItem.index}
                onMouseDown={() => handleSelect(user)}
                className={clsx(
                  "hover:bg-primary hover:text-background group absolute top-0 flex w-full cursor-pointer gap-x-4 p-4 transition-colors duration-300",
                  highlightedIndex === i
                    ? "bg-primary text-background"
                    : i % 2 === 0
                      ? "bg-background/50"
                      : "bg-h-background",
                )}
                style={{
                  transform: `translateY(${virtualItem.start}px)`,
                }}
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
                  <p className="truncate font-semibold">
                    {user.name}
                    {user.id === loggedUser?.id && " (yo)"}
                  </p>

                  <p className="truncate text-sm">
                    {user.email ?? user.contactEmail}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {isLoading && (
        <div className="mt-3 flex flex-col gap-1.5">
          <p className="text-foreground/75 text-sm">Buscando...</p>

          <LoadingBar />
        </div>
      )}

      {showNoResults && (
        <p className="text-warning mt-1.5 text-sm">
          {isDuplicateVirtualUserName
            ? "Ya agregaste un usuario con ese nombre"
            : "No se encontraron resultados para su busqueda"}
        </p>
      )}

      {showVirtualUserOption && (
        <Button
          variant="text"
          color="secondary"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleCreateVirtualUser}
          className="!flex-start mt-3 flex !p-0 text-start text-sm"
        >
          {isEmailQuery ? (
            <>
              <Mail
                className={clsx(
                  "inline h-5.5 min-h-5.5 w-5.5 min-w-5.5 transition-colors duration-300",
                )}
              />
              <p>
                Invitar a{" "}
                <span className="text-primary">
                  &quot;{debouncedQuery}&quot;{" "}
                </span>
                por email
              </p>
            </>
          ) : (
            <>
              <UserRoundPlus
                className={clsx(
                  "inline h-5.5 min-h-5.5 w-5.5 min-w-5.5 transition-colors duration-300",
                )}
              />
              <p>
                Agregar{" "}
                {
                  <span className="text-primary">
                    &quot;{debouncedQuery}&quot;{" "}
                  </span>
                }
                como usuario virtual
              </p>
            </>
          )}
        </Button>
      )}

      <InputErrorMessage message={error?.response?.data.error.message} />
    </div>
  );
};

export default UserSearchEngine;
