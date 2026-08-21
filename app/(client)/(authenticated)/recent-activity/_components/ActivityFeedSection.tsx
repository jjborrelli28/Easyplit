"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import Link from "next/link";

import { useSession } from "next-auth/react";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import debounce from "lodash.debounce";
import {
  Banknote,
  BanknoteArrowUp,
  CalendarClock,
  ClockFading,
  FolderInput,
  ListMinus,
  ListPlus,
  type LucideIcon,
  Pencil,
  PlusCircle,
  Search,
  SearchX,
  SlidersHorizontal,
  UserMinus,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";

import useGetMyExpenseHistories, {
  type MyExpenseHistoryEntry,
} from "@/hooks/data/user/useGetMyExpenseHistories";
import useGetMyExpensesAndGroups from "@/hooks/data/user/useGetMyExpensesAndGroups";
import useGetMyGroupHistories, {
  type MyGroupHistoryEntry,
} from "@/hooks/data/user/useGetMyGroupHistories";

import type { Expense, Group } from "@/lib/api/types";

import AmountNumber from "@/components/AmountNumber";
import Button from "@/components/Button";
import Collapse from "@/components/Collapse";
import {
  EXPENSE_TYPE,
  EXPENSE_TYPES,
} from "@/components/ExpenseTypeSelect/constants";
import {
  GROUP_TYPE,
  GROUP_TYPES,
} from "@/components/GroupTypeSelect/constants";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Spinner from "@/components/Spinner";

type EntityType = "expense" | "group";

enum ACTIVITY_CATEGORY {
  CREATION = "CREATION",
  PAYMENT = "PAYMENT",
  MEMBERSHIP = "MEMBERSHIP",
  EDIT = "EDIT",
  GROUP_EXPENSES = "GROUP_EXPENSES",
}

const ACTIVITY_CATEGORY_LABELS: Record<ACTIVITY_CATEGORY, string> = {
  [ACTIVITY_CATEGORY.CREATION]: "Creación",
  [ACTIVITY_CATEGORY.PAYMENT]: "Pagos",
  [ACTIVITY_CATEGORY.MEMBERSHIP]: "Participantes y miembros",
  [ACTIVITY_CATEGORY.EDIT]: "Ediciones",
  [ACTIVITY_CATEGORY.GROUP_EXPENSES]: "Gastos de grupo",
};

const ACTIVITY_CATEGORY_ICONS: Record<ACTIVITY_CATEGORY, LucideIcon> = {
  [ACTIVITY_CATEGORY.CREATION]: PlusCircle,
  [ACTIVITY_CATEGORY.PAYMENT]: BanknoteArrowUp,
  [ACTIVITY_CATEGORY.MEMBERSHIP]: UserPlus,
  [ACTIVITY_CATEGORY.EDIT]: Pencil,
  [ACTIVITY_CATEGORY.GROUP_EXPENSES]: ListPlus,
};

const ENTITY_TYPE_OPTIONS: { value: "all" | EntityType; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "expense", label: "Gastos" },
  { value: "group", label: "Grupos" },
];

interface ActivityEntry {
  id: string;
  createdAt: Date;
  icon: LucideIcon;
  iconClassName: string;
  message: ReactNode;
  entityName: string;
  href: string;
  entityType: EntityType;
  category: ACTIVITY_CATEGORY;
  searchText: string;
}

const parseJson = <T,>(value: string | null): T | null => {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

// Every verb this feed uses is a regular preterite (cambió, agregó, quitó,
// asignó, registró, creó, salió) — swapping 3rd person for the "vos" form
// is always the same suffix change, so one rule covers all of them instead
// of hand-writing a second form per template.
const toVoseoPreterite = (thirdPerson: string) =>
  thirdPerson.replace(/ió$/, "iste").replace(/ó$/, "aste");

const actorLabel = (isSelf: boolean, name: string | null) =>
  isSelf ? "Vos" : (name ?? "Alguien");

const joinNames = (names: string[]) => {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];

  return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
};

// Resolves a list of ids against whatever names could be found; falls back
// to a count ("2 participantes") instead of a partial/misleading name list
// when some ids couldn't be resolved (e.g. a member added and later removed
// again before this feed is read).
const describeMany = (
  resolvedNames: string[],
  totalCount: number,
  noun: string,
) => {
  if (resolvedNames.length === totalCount && resolvedNames.length > 0) {
    return joinNames(resolvedNames);
  }

  return totalCount === 1 ? `un ${noun}` : `${totalCount} ${noun}s`;
};

interface EntryTemplate {
  icon: LucideIcon;
  iconClassName: string;
  verb: string;
  tail: ReactNode;
  category: ACTIVITY_CATEGORY;
  searchTerms?: string[];
}

const buildEntry = (
  id: string,
  createdAt: Date | string,
  href: string,
  entityName: string,
  entityType: EntityType,
  actorId: string,
  actorName: string | null,
  loggedUserId: string,
  template: EntryTemplate,
): ActivityEntry => {
  const isSelf = actorId === loggedUserId;
  const verb = isSelf ? toVoseoPreterite(template.verb) : template.verb;
  const resolvedActor = actorLabel(isSelf, actorName);

  return {
    id,
    createdAt: new Date(createdAt),
    icon: template.icon,
    iconClassName: template.iconClassName,
    entityName,
    href,
    entityType,
    category: template.category,
    searchText: [
      resolvedActor,
      entityName,
      ACTIVITY_CATEGORY_LABELS[template.category],
      ...(template.searchTerms ?? []),
    ]
      .join(" ")
      .toLowerCase(),
    message: (
      <>
        <span className="font-semibold">{resolvedActor}</span> {verb}{" "}
        {template.tail}
      </>
    ),
  };
};

const parseExpenseHistoryEntry = (
  entry: MyExpenseHistoryEntry,
  loggedUserId: string,
  expensesById: Map<string, Expense>,
  groupsById: Map<string, Group>,
): ActivityEntry | null => {
  const href = `/expense/${entry.expense.id}`;
  const entityName = entry.expense.name;
  const expense = expensesById.get(entry.expense.id);
  const actorId = entry.updatedById;
  const actorName = entry.updatedBy?.name ?? null;

  const build = (template: EntryTemplate) =>
    buildEntry(
      entry.id,
      entry.createdAt,
      href,
      entityName,
      "expense",
      actorId,
      actorName,
      loggedUserId,
      template,
    );

  switch (entry.field) {
    case "name": {
      const newName = parseJson<string>(entry.newValue);
      if (!newName) return null;

      return build({
        icon: Pencil,
        iconClassName: "bg-secondary",
        verb: "cambió",
        tail: <>el nombre a “{newName}”.</>,
        category: ACTIVITY_CATEGORY.EDIT,
        searchTerms: [newName],
      });
    }

    case "type": {
      const newType = parseJson<string>(entry.newValue);
      const typeConfig = newType
        ? EXPENSE_TYPES[newType as keyof typeof EXPENSE_TYPES]
        : null;
      if (!typeConfig) return null;

      return build({
        icon: typeConfig.icon,
        iconClassName: typeConfig.color,
        verb: "cambió",
        tail: <>la categoría a “{typeConfig.label}”.</>,
        category: ACTIVITY_CATEGORY.EDIT,
        searchTerms: [typeConfig.label],
      });
    }

    case "participantsToAdd": {
      const userIds = parseJson<string[]>(entry.newValue) ?? [];
      if (userIds.length === 0) return null;

      const resolvedNames = userIds
        .map(
          (id) => expense?.participants.find((p) => p.userId === id)?.user.name,
        )
        .filter((name): name is string => !!name);

      return build({
        icon: UserPlus,
        iconClassName: "bg-info",
        verb: "agregó",
        tail: (
          <>a {describeMany(resolvedNames, userIds.length, "participante")}.</>
        ),
        category: ACTIVITY_CATEGORY.MEMBERSHIP,
        searchTerms: resolvedNames,
      });
    }

    case "participantToRemove": {
      const payload = parseJson<{
        userId?: string;
        name?: string | null;
        isVirtual?: boolean;
      }>(entry.newValue);
      if (!payload?.userId) return null;

      const isSelfRemoval = payload.userId === actorId;

      return build({
        icon: UserMinus,
        iconClassName: "bg-danger",
        verb: isSelfRemoval ? "salió" : "quitó",
        tail: isSelfRemoval ? (
          <>del gasto.</>
        ) : (
          <>
            a {payload.name ?? "un participante"}
            {payload.isVirtual && " (usuario virtual)"}.
          </>
        ),
        category: ACTIVITY_CATEGORY.MEMBERSHIP,
        searchTerms: payload.name ? [payload.name] : [],
      });
    }

    case "paidById": {
      const newPaidById = parseJson<string>(entry.newValue);
      if (!newPaidById) return null;

      const payerName =
        expense?.participants.find((p) => p.userId === newPaidById)?.user
          .name ?? "otro participante";

      return build({
        icon: Wallet,
        iconClassName: "bg-primary",
        verb: "cambió",
        tail: <>quién pagó el gasto a {payerName}.</>,
        category: ACTIVITY_CATEGORY.EDIT,
        searchTerms: [payerName],
      });
    }

    case "paymentDate": {
      const newDate = parseJson<string>(entry.newValue);
      if (!newDate) return null;

      const formattedDate = format(
        new Date(newDate),
        "dd 'de' MMMM 'del' yyyy",
        { locale: es },
      );

      return build({
        icon: CalendarClock,
        iconClassName: "bg-secondary",
        verb: "cambió",
        tail: <>la fecha de pago al {formattedDate}.</>,
        category: ACTIVITY_CATEGORY.EDIT,
        searchTerms: [formattedDate],
      });
    }

    case "groupId": {
      const newGroupId = parseJson<string>(entry.newValue);
      if (!newGroupId) return null;

      const groupName = groupsById.get(newGroupId)?.name ?? "un grupo";

      return build({
        icon: FolderInput,
        iconClassName: "bg-info",
        verb: "asignó",
        tail: <>el gasto al grupo “{groupName}”.</>,
        category: ACTIVITY_CATEGORY.EDIT,
        searchTerms: [groupName],
      });
    }

    case "amount": {
      const newAmount = parseJson<number>(entry.newValue);
      if (newAmount === null) return null;

      return build({
        icon: Banknote,
        iconClassName: "bg-primary",
        verb: "cambió",
        tail: (
          <>
            el monto a <AmountNumber size="sm">{newAmount}</AmountNumber>.
          </>
        ),
        category: ACTIVITY_CATEGORY.EDIT,
      });
    }

    case "participantPayment": {
      const payload = parseJson<{
        userId?: string;
        amount?: number;
        name?: string | null;
      }>(entry.newValue);
      if (!payload?.amount) return null;

      const isOwnPayment = payload.userId === actorId;

      return build({
        icon: BanknoteArrowUp,
        iconClassName: "bg-success",
        verb: "registró",
        tail: isOwnPayment ? (
          <>
            un pago de <AmountNumber size="sm">{payload.amount}</AmountNumber>.
          </>
        ) : (
          <>
            un pago de <AmountNumber size="sm">{payload.amount}</AmountNumber>{" "}
            de {payload.name ?? "un participante"}.
          </>
        ),
        category: ACTIVITY_CATEGORY.PAYMENT,
        searchTerms: payload.name ? [payload.name] : [],
      });
    }

    default:
      return null;
  }
};

const parseGroupHistoryEntry = (
  entry: MyGroupHistoryEntry,
  loggedUserId: string,
  expensesById: Map<string, Expense>,
  groupsById: Map<string, Group>,
): ActivityEntry | null => {
  const href = `/group/${entry.group.id}`;
  const entityName = entry.group.name;
  const group = groupsById.get(entry.group.id);
  const actorId = entry.updatedById;
  const actorName = entry.updatedBy?.name ?? null;

  const build = (template: EntryTemplate) =>
    buildEntry(
      entry.id,
      entry.createdAt,
      href,
      entityName,
      "group",
      actorId,
      actorName,
      loggedUserId,
      template,
    );

  switch (entry.field) {
    case "name": {
      const newName = parseJson<string>(entry.newValue);
      if (!newName) return null;

      return build({
        icon: Pencil,
        iconClassName: "bg-secondary",
        verb: "cambió",
        tail: <>el nombre a “{newName}”.</>,
        category: ACTIVITY_CATEGORY.EDIT,
        searchTerms: [newName],
      });
    }

    case "type": {
      const newType = parseJson<string>(entry.newValue);
      const typeConfig = newType
        ? GROUP_TYPES[newType as keyof typeof GROUP_TYPES]
        : null;
      if (!typeConfig) return null;

      return build({
        icon: typeConfig.icon,
        iconClassName: typeConfig.color,
        verb: "cambió",
        tail: <>la categoría a “{typeConfig.label}”.</>,
        category: ACTIVITY_CATEGORY.EDIT,
        searchTerms: [typeConfig.label],
      });
    }

    case "membersToAdd": {
      const userIds = parseJson<string[]>(entry.newValue) ?? [];
      if (userIds.length === 0) return null;

      const resolvedNames = userIds
        .map((id) => group?.members.find((m) => m.userId === id)?.user.name)
        .filter((name): name is string => !!name);

      return build({
        icon: UserPlus,
        iconClassName: "bg-info",
        verb: "agregó",
        tail: <>a {describeMany(resolvedNames, userIds.length, "miembro")}.</>,
        category: ACTIVITY_CATEGORY.MEMBERSHIP,
        searchTerms: resolvedNames,
      });
    }

    case "memberToRemove": {
      // `newValue` is either a plain id (manual "remove member") or
      // `{ userId, name, isVirtual }` (a virtual user hard-deleted via
      // /api/user/virtual-users/[id]) — either way, the removed member's
      // id/name/isVirtual are already resolved server-side onto `entry`
      // (see /api/user/group-histories), so only the id itself needs
      // parsing here, just to tell a self-removal apart from being removed.
      const parsed = parseJson<string | { userId: string }>(entry.newValue);
      const removedUserId =
        typeof parsed === "string" ? parsed : parsed?.userId;
      if (!removedUserId) return null;

      const isSelfRemoval = removedUserId === actorId;

      return build({
        icon: UserMinus,
        iconClassName: "bg-danger",
        verb: isSelfRemoval ? "salió" : "quitó",
        tail: isSelfRemoval ? (
          <>del grupo.</>
        ) : (
          <>
            a {entry.removedMemberName ?? "un miembro"}
            {entry.removedMemberIsVirtual && " (usuario virtual)"}.
          </>
        ),
        category: ACTIVITY_CATEGORY.MEMBERSHIP,
        searchTerms: entry.removedMemberName ? [entry.removedMemberName] : [],
      });
    }

    case "expensesToAdd": {
      const expenseIds = parseJson<string[]>(entry.newValue) ?? [];
      if (expenseIds.length === 0) return null;

      const resolvedNames = expenseIds
        .map((id) => expensesById.get(id)?.name)
        .filter((name): name is string => !!name);

      return build({
        icon: ListPlus,
        iconClassName: "bg-info",
        verb: "agregó",
        tail:
          resolvedNames.length === 1 ? (
            <>el gasto “{resolvedNames[0]}”.</>
          ) : (
            <>{describeMany(resolvedNames, expenseIds.length, "gasto")}.</>
          ),
        category: ACTIVITY_CATEGORY.GROUP_EXPENSES,
        searchTerms: resolvedNames,
      });
    }

    case "expenseToRemove": {
      const expenseId = parseJson<string>(entry.newValue);
      if (!expenseId) return null;

      const expenseName = expensesById.get(expenseId)?.name;

      return build({
        icon: ListMinus,
        iconClassName: "bg-danger",
        verb: "quitó",
        tail: expenseName ? <>el gasto “{expenseName}”.</> : <>un gasto.</>,
        category: ACTIVITY_CATEGORY.GROUP_EXPENSES,
        searchTerms: expenseName ? [expenseName] : [],
      });
    }

    default:
      return null;
  }
};

const parseExpenseCreationEntry = (
  expense: Expense,
  loggedUserId: string,
): ActivityEntry => {
  const typeConfig =
    EXPENSE_TYPES[
      (expense.type ?? EXPENSE_TYPE.UNCATEGORIZED) as keyof typeof EXPENSE_TYPES
    ];

  return buildEntry(
    `expense-created-${expense.id}`,
    expense.createdAt,
    `/expense/${expense.id}`,
    expense.name,
    "expense",
    expense.createdBy?.id ?? expense.createdById,
    expense.createdBy?.name ?? null,
    loggedUserId,
    {
      icon: typeConfig.icon,
      iconClassName: typeConfig.color,
      verb: "creó",
      tail: <>el gasto “{expense.name}”.</>,
      category: ACTIVITY_CATEGORY.CREATION,
    },
  );
};

const parseGroupCreationEntry = (
  group: Group,
  loggedUserId: string,
): ActivityEntry => {
  const typeConfig =
    GROUP_TYPES[(group.type ?? GROUP_TYPE.OTHER) as keyof typeof GROUP_TYPES];

  return buildEntry(
    `group-created-${group.id}`,
    group.createdAt,
    `/group/${group.id}`,
    group.name,
    "group",
    group.createdBy?.id ?? group.createdById,
    group.createdBy?.name ?? null,
    loggedUserId,
    {
      icon: typeConfig.icon,
      iconClassName: typeConfig.color,
      verb: "creó",
      tail: <>el grupo “{group.name}”.</>,
      category: ACTIVITY_CATEGORY.CREATION,
    },
  );
};

const PAGE_SIZE = 20;

const ActivityFeedSection = () => {
  const { data: session } = useSession();
  const loggedUserId = session?.user?.id;

  const { data: expensesAndGroups, isPending: isPendingExpensesAndGroups } =
    useGetMyExpensesAndGroups();
  const { data: expenseHistories, isPending: isPendingExpenseHistories } =
    useGetMyExpenseHistories();
  const { data: groupHistories, isPending: isPendingGroupHistories } =
    useGetMyGroupHistories();

  const isPending =
    !loggedUserId ||
    isPendingExpensesAndGroups ||
    isPendingExpenseHistories ||
    isPendingGroupHistories;

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [entityFilter, setEntityFilter] = useState<"all" | EntityType>("all");
  const [categoryFilter, setCategoryFilter] = useState<Set<ACTIVITY_CATEGORY>>(
    new Set(),
  );
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filtersRef.current &&
        !filtersRef.current.contains(event.target as Node)
      ) {
        setIsFiltersOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const toggleCategory = (category: ACTIVITY_CATEGORY) => {
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
    setEntityFilter("all");
    setCategoryFilter(new Set());
  };

  const activeFilterCount =
    (entityFilter !== "all" ? 1 : 0) + categoryFilter.size;

  const allActivity = useMemo(() => {
    if (!loggedUserId) return [];

    const expenses = expensesAndGroups?.expenses ?? [];
    const groups = expensesAndGroups?.groups ?? [];

    const expensesById = new Map(
      expenses.map((expense) => [expense.id, expense]),
    );
    const groupsById = new Map(groups.map((group) => [group.id, group]));

    const creationEntries = [
      ...expenses.map((expense) =>
        parseExpenseCreationEntry(expense, loggedUserId),
      ),
      ...groups.map((group) => parseGroupCreationEntry(group, loggedUserId)),
    ];

    const expenseHistoryEntries = (expenseHistories ?? [])
      .map((entry) =>
        parseExpenseHistoryEntry(entry, loggedUserId, expensesById, groupsById),
      )
      .filter((entry): entry is ActivityEntry => entry !== null);

    const groupHistoryEntries = (groupHistories ?? [])
      .map((entry) =>
        parseGroupHistoryEntry(entry, loggedUserId, expensesById, groupsById),
      )
      .filter((entry): entry is ActivityEntry => entry !== null);

    return [
      ...creationEntries,
      ...expenseHistoryEntries,
      ...groupHistoryEntries,
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [loggedUserId, expensesAndGroups, expenseHistories, groupHistories]);

  const filteredActivity = useMemo(() => {
    let result = allActivity;

    if (entityFilter !== "all") {
      result = result.filter((entry) => entry.entityType === entityFilter);
    }

    if (categoryFilter.size > 0) {
      result = result.filter((entry) => categoryFilter.has(entry.category));
    }

    const normalizedQuery = debouncedQuery.trim().toLowerCase();
    if (normalizedQuery) {
      result = result.filter((entry) =>
        entry.searchText.includes(normalizedQuery),
      );
    }

    return sortOrder === "desc" ? result : [...result].reverse();
  }, [allActivity, entityFilter, categoryFilter, debouncedQuery, sortOrder]);

  // Any change to the search/filter/sort criteria narrows or reshuffles the
  // result set, so the progressive "load more on scroll" window has to
  // restart from the first page instead of keeping a stale count.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [entityFilter, categoryFilter, debouncedQuery, sortOrder]);

  const visibleActivity = useMemo(
    () => filteredActivity.slice(0, visibleCount),
    [filteredActivity, visibleCount],
  );

  const virtualizer = useWindowVirtualizer({
    count: visibleActivity.length > 0 ? visibleActivity.length : 1,
    estimateSize: () => 82,
    gap: 0,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const lastVirtualItemIndex = virtualItems.at(-1)?.index;

  useEffect(() => {
    if (lastVirtualItemIndex === undefined) return;

    const isNearEnd = lastVirtualItemIndex >= visibleActivity.length - 5;
    const hasMoreToReveal = visibleCount < filteredActivity.length;

    if (isNearEnd && hasMoreToReveal) {
      setVisibleCount((prev) =>
        Math.min(prev + PAGE_SIZE, filteredActivity.length),
      );
    }
  }, [
    lastVirtualItemIndex,
    visibleActivity.length,
    filteredActivity.length,
    visibleCount,
  ]);

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-y-6">
      <div className="relative z-20 flex flex-col gap-y-4 md:items-start md:gap-x-4 lg:flex-row">
        <div className="relative w-full">
          <Input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Buscar por gasto, grupo o persona"
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
            value={sortOrder}
            onChange={(value) => setSortOrder(value as "desc" | "asc")}
            options={[
              { value: "desc", label: "Más reciente primero" },
              { value: "asc", label: "Más antiguo primero" },
            ]}
            containerClassName="w-full min-w-[221px] !pt-0 lg:w-auto"
          />

          <div ref={filtersRef} className="relative">
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setIsFiltersOpen((prev) => !prev)}
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

            <Collapse
              isOpen={isFiltersOpen}
              className="ring-primary bg-h-background absolute right-0 z-30 mt-2 w-screen max-w-[calc(100vw-2rem)] shadow-xl ring-1 sm:w-md"
              contentClassName={clsx(
                "flex flex-col gap-y-4 px-4 transition-[padding]",
                isFiltersOpen && "py-4",
              )}
            >
              <div className="flex flex-col gap-y-2">
                <p className="text-sm font-semibold">Tipo</p>

                <div className="flex flex-wrap gap-2">
                  {ENTITY_TYPE_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => setEntityFilter(option.value)}
                      variant={
                        entityFilter === option.value ? "contained" : "outlined"
                      }
                      color={
                        entityFilter === option.value ? "primary" : "secondary"
                      }
                      className="!min-w-0 !px-3 !py-1.5 text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-y-2">
                <p className="text-sm font-semibold">Tipo de actividad</p>

                <div className="flex flex-wrap gap-2">
                  {Object.values(ACTIVITY_CATEGORY).map((category) => {
                    const isSelected = categoryFilter.has(category);
                    const Icon = ACTIVITY_CATEGORY_ICONS[category];

                    return (
                      <Button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        variant={isSelected ? "contained" : "outlined"}
                        color={isSelected ? "primary" : "secondary"}
                        className="!min-w-0 !gap-x-1.5 !px-3 !py-1.5 text-xs"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {ACTIVITY_CATEGORY_LABELS[category]}
                      </Button>
                    );
                  })}
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
            </Collapse>
          </div>
        </div>
      </div>

      {allActivity.length === 0 ? (
        <div className="flex flex-1 flex-col items-center gap-y-4 pt-16 text-center">
          <ClockFading className="text-foreground/50 h-12 w-12" />

          <p className="text-foreground/75">
            Todavía no hay actividad para mostrar. Cuando crees o modifiques un
            gasto o un grupo, va a aparecer acá.
          </p>
        </div>
      ) : filteredActivity.length === 0 ? (
        <div className="flex flex-1 flex-col items-center gap-y-4 pt-16 text-center">
          <SearchX className="text-foreground/50 h-12 w-12" />

          <p className="text-foreground/75">
            No encontramos actividad que coincida con tu búsqueda o filtros.
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
            const item = visibleActivity[virtualItem.index];

            if (!item) return null;

            const Icon = item.icon;

            return (
              <Link
                ref={virtualizer.measureElement}
                key={virtualItem.key}
                data-index={virtualItem.index}
                href={item.href}
                className={clsx(
                  "border-h-background hover:border-primary absolute top-0 left-0 flex w-full items-start gap-x-4 border p-4 transition-colors duration-300",
                  virtualItem.index % 2 === 0 && "bg-h-background",
                )}
                style={{ transform: `translateY(${virtualItem.start}px)` }}
              >
                <div
                  className={clsx(
                    "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full",
                    item.iconClassName,
                  )}
                >
                  <Icon className="text-background h-6 w-6" />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-y-0.5">
                  <p className="text-sm">{item.message}</p>

                  <p className="text-foreground/75 truncate text-xs">
                    en “{item.entityName}” —{" "}
                    {format(item.createdAt, "dd 'de' MMMM 'del' yyyy, HH:mm", {
                      locale: es,
                    })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityFeedSection;
