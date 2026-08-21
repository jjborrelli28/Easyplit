"use client";

import { useEffect, useMemo, useState } from "react";

import type { Session } from "next-auth";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import debounce from "lodash.debounce";
import {
  CarFront,
  Gamepad2,
  House,
  Lightbulb,
  type LucideIcon,
  Receipt,
  Search,
  SearchX,
  Shirt,
  SlidersHorizontal,
  Utensils,
  Wallet,
  X,
} from "lucide-react";

import type { Expense } from "@/lib/api/types";
import { areAllDebtsSettled } from "@/lib/utils";

import Button from "@/components/Button";
import Card, { CARD_TYPE } from "@/components/Card";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_TYPE,
} from "@/components/ExpenseTypeSelect/constants";
import Input from "@/components/Input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";
import Select from "@/components/Select";

type ExpenseCategory = keyof typeof EXPENSE_CATEGORIES;
type OriginFilter = "all" | "personal" | "group";
type StatusFilter = "all" | "completed" | "pending";
type SortOption = "recent" | "oldest" | "amount-desc" | "amount-asc";

interface ExpenseListSectionProps {
  expenses: Expense[];
  loggedUser: Session["user"];
}

const PAGE_SIZE = 20;

// Every EXPENSE_TYPE resolves to exactly one broad category, so this map is
// built once from the same source of truth ExpenseTypeSelect uses, instead
// of hand-listing the ~50 types a second time.
const TYPE_TO_CATEGORY = Object.entries(EXPENSE_CATEGORIES).reduce<
  Record<string, ExpenseCategory>
>((acc, [category, types]) => {
  types.forEach((type) => {
    acc[type] = category as ExpenseCategory;
  });

  return acc;
}, {});

const CATEGORY_META: Record<ExpenseCategory, { icon: LucideIcon }> = {
  Casa: { icon: House },
  Comida: { icon: Utensils },
  Entretenimiento: { icon: Gamepad2 },
  Transporte: { icon: CarFront },
  Servicios: { icon: Lightbulb },
  Vida: { icon: Shirt },
  Otro: { icon: Receipt },
};

const ORIGIN_OPTIONS: { value: OriginFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "personal", label: "Personales" },
  { value: "group", label: "Grupales" },
];

// Matches the wording already used on each expense's own badge
// (Card.tsx / BalanceSection), so the filter reads consistently with what
// the results actually show.
const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "completed", label: "Completos" },
  { value: "pending", label: "Incompletos" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Más reciente primero" },
  { value: "oldest", label: "Más antiguo primero" },
  { value: "amount-desc", label: "Monto: mayor a menor" },
  { value: "amount-asc", label: "Monto: menor a mayor" },
];

const ExpenseListSection = ({ expenses, loggedUser }: ExpenseListSectionProps) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [originFilter, setOriginFilter] = useState<OriginFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<Set<ExpenseCategory>>(
    new Set(),
  );
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const debouncedSetQuery = useMemo(
    () => debounce((value: string) => setDebouncedQuery(value), 300),
    [],
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    debouncedSetQuery(value);
  };

  const handleClearQuery = () => {
    setQuery("");
    setDebouncedQuery("");
  };

  const toggleCategory = (category: ExpenseCategory) => {
    setCategoryFilter((prev) => {
      const next = new Set(prev);

      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }

      return next;
    });
  };

  const clearFilters = () => {
    setOriginFilter("all");
    setStatusFilter("all");
    setCategoryFilter(new Set());
  };

  const activeFilterCount =
    (originFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    categoryFilter.size;

  const filteredExpenses = useMemo(() => {
    let result = expenses;

    if (originFilter !== "all") {
      result = result.filter((expense) =>
        originFilter === "group" ? !!expense.groupId : !expense.groupId,
      );
    }

    if (categoryFilter.size > 0) {
      result = result.filter((expense) => {
        const category =
          TYPE_TO_CATEGORY[expense.type ?? EXPENSE_TYPE.UNCATEGORIZED] ??
          "Otro";

        return categoryFilter.has(category);
      });
    }

    if (statusFilter !== "all") {
      result = result.filter((expense) =>
        statusFilter === "completed"
          ? areAllDebtsSettled(expense)
          : !areAllDebtsSettled(expense),
      );
    }

    const normalizedQuery = debouncedQuery.trim().toLowerCase();

    if (normalizedQuery) {
      result = result.filter((expense) =>
        [expense.name, expense.paidBy?.name, expense.group?.name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      );
    }

    return [...result].sort((a, b) => {
      switch (sortOption) {
        case "recent":
          return (
            new Date(b.paymentDate).getTime() -
            new Date(a.paymentDate).getTime()
          );
        case "oldest":
          return (
            new Date(a.paymentDate).getTime() -
            new Date(b.paymentDate).getTime()
          );
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
      }
    });
  }, [
    expenses,
    originFilter,
    statusFilter,
    categoryFilter,
    debouncedQuery,
    sortOption,
  ]);

  // Any change to the search/filter/sort criteria narrows or reshuffles the
  // result set, so the progressive "load more on scroll" window has to
  // restart from the first page instead of keeping a stale count.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [originFilter, statusFilter, categoryFilter, debouncedQuery, sortOption]);

  const visibleExpenses = useMemo(
    () => filteredExpenses.slice(0, visibleCount),
    [filteredExpenses, visibleCount],
  );

  const virtualizer = useWindowVirtualizer({
    count: visibleExpenses.length > 0 ? visibleExpenses.length : 1,
    estimateSize: () => 112.72,
    gap: 20,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const lastVirtualItemIndex = virtualItems.at(-1)?.index;

  useEffect(() => {
    if (lastVirtualItemIndex === undefined) return;

    const isNearEnd = lastVirtualItemIndex >= visibleExpenses.length - 5;
    const hasMoreToReveal = visibleCount < filteredExpenses.length;

    if (isNearEnd && hasMoreToReveal) {
      setVisibleCount((prev) =>
        Math.min(prev + PAGE_SIZE, filteredExpenses.length),
      );
    }
  }, [
    lastVirtualItemIndex,
    visibleExpenses.length,
    filteredExpenses.length,
    visibleCount,
  ]);

  return (
    <section className="flex flex-1 flex-col gap-y-6">
      <p className="text-xl font-semibold">
        Gastos <span>({filteredExpenses.length})</span>
      </p>

      <div className="relative z-20 flex flex-col gap-y-4 md:items-start md:gap-x-4 lg:flex-row">
        <div className="relative w-full">
          <Input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Buscar por nombre, grupo o quien pagó"
          />

          <div className="bg-background absolute top-1/2 right-3 -translate-y-1/2 pl-3">
            {query ? (
              <Button
                aria-label="Clear search"
                onClick={handleClearQuery}
                unstyled
                className="hover:text-primary cursor-pointer transition-colors duration-300"
              >
                <X className="h-5.5 w-5.5" />
              </Button>
            ) : (
              <Search className="text-foreground pointer-events-none h-5.5 w-5.5" />
            )}
          </div>
        </div>

        <div className="flex w-full items-center justify-end gap-x-4 lg:w-auto">
          <Select
            value={sortOption}
            onChange={(value) => setSortOption(value as SortOption)}
            options={SORT_OPTIONS}
            containerClassName="w-full min-w-[221px] !pt-0 lg:w-auto"
          />

          <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outlined"
                color="secondary"
                className="flex items-center gap-x-2 self-start"
              >
                <SlidersHorizontal className="h-4 w-4 min-w-4" />
                Filtros
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-background flex h-5 w-5 min-w-5 items-center justify-center rounded-full text-xs font-semibold">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              className="!w-[min(28rem,var(--radix-popover-content-available-width))] flex flex-col gap-y-4"
            >
              <div className="flex flex-col gap-y-2">
                <p className="text-sm font-semibold">Origen</p>

                <div className="flex flex-wrap gap-2">
                  {ORIGIN_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => setOriginFilter(option.value)}
                      variant={
                        originFilter === option.value ? "contained" : "outlined"
                      }
                      color={
                        originFilter === option.value ? "primary" : "secondary"
                      }
                      className="!min-w-0 !px-3 !py-1.5 text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-y-2">
                <p className="text-sm font-semibold">Estado</p>

                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => setStatusFilter(option.value)}
                      variant={
                        statusFilter === option.value ? "contained" : "outlined"
                      }
                      color={
                        statusFilter === option.value ? "primary" : "secondary"
                      }
                      className="!min-w-0 !px-3 !py-1.5 text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-y-2">
                <p className="text-sm font-semibold">Categoría</p>

                <div className="flex flex-wrap gap-2">
                  {(Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[]).map(
                    (category) => {
                      const isSelected = categoryFilter.has(category);
                      const Icon = CATEGORY_META[category].icon;

                      return (
                        <Button
                          key={category}
                          onClick={() => toggleCategory(category)}
                          variant={isSelected ? "contained" : "outlined"}
                          color={isSelected ? "primary" : "secondary"}
                          className="!min-w-0 !gap-x-1.5 !px-3 !py-1.5 text-xs"
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {category}
                        </Button>
                      );
                    },
                  )}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <Button
                  variant="text"
                  color="secondary"
                  onClick={clearFilters}
                  className="!min-w-0 self-start !p-0 text-xs underline"
                >
                  Limpiar filtros
                </Button>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-1 flex-col items-center gap-y-4 pt-16 text-center">
          <Wallet className="text-foreground/50 h-12 w-12" />

          <p className="text-foreground/75">
            No hay gastos registrados. Creá un gasto para empezar a organizar
            tus finanzas.
          </p>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="flex flex-1 flex-col items-center gap-y-4 pt-16 text-center">
          <SearchX className="text-foreground/50 h-12 w-12" />

          <p className="text-foreground/75">
            No encontramos gastos que coincidan con tu búsqueda o filtros.
          </p>

          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              handleClearQuery();
              clearFilters();
            }}
          >
            Limpiar búsqueda y filtros
          </Button>
        </div>
      ) : (
        <div
          className="relative w-full"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualItems.map((virtualItem) => {
            const expense = visibleExpenses[virtualItem.index];

            if (!expense) return null;

            return (
              <div
                ref={virtualizer.measureElement}
                key={virtualItem.key}
                data-index={virtualItem.index}
                className="absolute top-0 left-0 w-full"
                style={{ transform: `translateY(${virtualItem.start}px)` }}
              >
                <Card
                  type={CARD_TYPE.EXPENSE}
                  data={expense}
                  loggedUser={loggedUser}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ExpenseListSection;
