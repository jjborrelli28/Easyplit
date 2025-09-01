"use client";

import { useMemo, useState } from "react";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";
import debounce from "lodash.debounce";
import { Search } from "lucide-react";

import useSearchExpenses, {
  type Expense,
} from "@/hooks/data/expenses/useSearchExpenses";

import { EXPENSE_TYPE, EXPENSE_TYPES } from "../ExpenseTypeSelect/constants";
import Input, { type InputProps } from "../Input";
import InputErrorMessage from "../InputErrorMessage";

export interface ExpenseSearchEngineProps
  extends Omit<InputProps, "value" | "onSelect"> {
  onSelect: (expense: Expense) => void;
  onChange?: VoidFunction;
  onFocus?: VoidFunction;
  onBlur?: VoidFunction;
  excludeExpenseIds?: string[];
}

const ExpenseSearchEngine = ({
  onSelect,
  onChange,
  onFocus,
  onBlur,
  excludeExpenseIds = [],
}: ExpenseSearchEngineProps) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const {
    data: expenses = [],
    error,
    isFetched,
  } = useSearchExpenses(debouncedQuery);

  const filteredExpenses = useMemo(
    () => expenses.filter((expense) => !excludeExpenseIds.includes(expense.id)),
    [expenses, excludeExpenseIds],
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

  const handleSelect = (expense: Expense) => {
    onSelect(expense);
    setQuery("");
    setDebouncedQuery("");
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredExpenses.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredExpenses.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredExpenses.length - 1,
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredExpenses[highlightedIndex]);
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
    count: filteredExpenses.length,
    estimateSize: () => 80,
    overscan: 5,
    enabled: true,
  });

  return (
    <div className="relative w-full max-w-md">
      <Input
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Buscar por nombre de gasto"
        error={
          isFetched && filteredExpenses.length === 0 && !error
            ? "No se encontraron resultados para su busqueda"
            : null
        }
        errorClassName="text-warning"
      />

      <div className="bg-background pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 pl-3">
        <Search
          className={clsx(
            "text-foreground h-5.5 w-5.5 transition-colors duration-300",
            isFocused && "text-primary",
          )}
        />
      </div>

      {filteredExpenses.length > 0 && (
        <ul
          className="bg-h-background border-primary absolute top-full right-0 left-0 z-20 max-h-120 overflow-y-auto border !border-t-0 shadow-xl"
          style={{
            height: `${virtualizer.getTotalSize()}px`,
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem, i) => {
            const expense = filteredExpenses[virtualItem.index];

            if (!expense) return null;

            const type = expense?.type ?? EXPENSE_TYPE.UNCATEGORIZED;
            const Icon = EXPENSE_TYPES[type].icon;

            return (
              <li
                ref={virtualizer.measureElement}
                key={virtualItem.key}
                data-index={virtualItem.index}
                onMouseDown={() => handleSelect(expense)}
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
                    EXPENSE_TYPES[type].color,
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
                  <p className="truncate font-semibold">{expense.name}</p>
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

export default ExpenseSearchEngine;
