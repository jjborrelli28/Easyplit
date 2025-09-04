"use client";

import { useEffect, useMemo, useState } from "react";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";
import debounce from "lodash.debounce";
import { ChevronDown, Search } from "lucide-react";

import useSearchGroups, {
  type Group,
} from "@/hooks/data/groups/useSearchGroups";

import { GROUP_TYPE, GROUP_TYPES } from "../GroupTypeSelect/constants";
import Input, { type InputProps } from "../Input";
import InputErrorMessage from "../InputErrorMessage";
import Button from "../Button";

export interface GroupSearchEngineProps
  extends Omit<InputProps, "value" | "onSelect"> {
  onSelect: (group: Group) => void;
  onChange?: VoidFunction;
  onFocus?: VoidFunction;
  onBlur?: VoidFunction;
  excludeGroupIds?: string[];
}

const GroupSearchEngine = ({
  onSelect,
  onChange,
  onFocus,
  onBlur,
  excludeGroupIds = [],
}: GroupSearchEngineProps) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: groups = [],
    error,
    isFetched,
  } = useSearchGroups(debouncedQuery);

  const filteredGroups = useMemo(
    () => groups.filter((group) => !excludeGroupIds.includes(group.id)),
    [groups, excludeGroupIds],
  );

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

  const handleSelect = (group: Group) => {
    onSelect(group);
    setQuery("");
    setDebouncedQuery("");
    setHighlightedIndex(-1);
    setIsOpen(false);
  };

  const handleToggleIsOpen = () => {
    setIsOpen((prevState) => !prevState);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredGroups.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredGroups.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredGroups.length - 1,
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredGroups[highlightedIndex]);
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

  const virtualizer = useWindowVirtualizer({
    count: filteredGroups.length,
    estimateSize: () => 80,
    overscan: 5,
    enabled: true,
  });

  const isEmpty = filteredGroups.length === 0;

  useEffect(() => {
    if (debouncedQuery.trim() === "") {
      setIsOpen(false);
    } else {
      setIsOpen(!isEmpty);
    }
  }, [debouncedQuery, isEmpty]);

  return (
    <div className="relative w-full max-w-md">
      <Input
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Buscar por nombre de grupo"
        error={
          isFetched && isEmpty && !error && excludeGroupIds.length === 0
            ? "No se encontraron resultados para su busqueda"
            : null
        }
        errorClassName="text-warning"
        rightItem={
          <>
            <div className="bg-background pointer-events-none absolute top-1/2 right-15 -translate-y-1/2 pl-3">
              <Search
                className={clsx(
                  "text-foreground h-5.5 w-5.5 transition-colors duration-300",
                  isFocused && "text-primary",
                )}
              />
            </div>

            <div
              className={clsx(
                "-ml-1 flex h-[50px] items-center border-b transition-colors duration-300",
                isFocused ? "border-b-primary" : "border-b-foreground",
              )}
            >
              <Button
                aria-label="Toggle group list"
                onClick={handleToggleIsOpen}
                unstyled
                className={clsx(
                  "border-l-h-background border-l",
                  isEmpty ? "cursor-not-allowed" : "cursor-pointer",
                )}
                disabled={isEmpty}
              >
                <ChevronDown
                  className={clsx(
                    "transition-traslate mx-3 h-5.5 w-5.5 duration-300",
                    isEmpty ? "text-h-background" : "text-primary",
                    isOpen && "-rotate-180",
                  )}
                />
              </Button>
            </div>
          </>
        }
      />

      {isOpen && !isEmpty && (
        <ul
          className="bg-h-background border-primary absolute top-full right-0 left-0 z-20 max-h-120 overflow-y-auto border !border-t-0 shadow-xl"
          style={{
            height: `${virtualizer.getTotalSize()}px`,
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem, i) => {
            const group = filteredGroups[virtualItem.index];

            if (!group) return null;

            const type = group?.type ?? GROUP_TYPE.OTHER;
            const Icon = GROUP_TYPES[type].icon;
            const expenses = group.expenses;
            const total = expenses.reduce(
              (sum, expense) => sum + expense.amount,
              0,
            );

            return (
              <li
                ref={virtualizer.measureElement}
                key={virtualItem.key}
                data-index={virtualItem.index}
                onMouseDown={() => handleSelect(group)}
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
                <div
                  className={clsx(
                    "flex h-12 w-12 min-w-12 items-center justify-center rounded-full",
                    GROUP_TYPES[type].color,
                  )}
                >
                  <Icon className="text-background h-7 w-7" />
                </div>

                <div
                  className={clsx(
                    "group-hover:bg-background h-12 w-[1px] transition-colors duration-300",
                    highlightedIndex === i ? "bg-background" : "bg-foreground",
                  )}
                />

                <div className="flex w-full flex-col justify-center overflow-hidden">
                  <p className="truncate font-semibold">{group.name}</p>

                  <p className="truncate text-sm">
                    {expenses.length > 0
                      ? `Total de gastos acumulados: $${total}`
                      : "El grupo no tiene gastos acumulados"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <InputErrorMessage message={error?.response?.data.error.message} />
    </div>
  );
};

export default GroupSearchEngine;
