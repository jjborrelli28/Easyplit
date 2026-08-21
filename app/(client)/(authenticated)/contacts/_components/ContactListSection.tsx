"use client";

import { useEffect, useMemo, useState } from "react";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import debounce from "lodash.debounce";
import {
  Search,
  SearchX,
  SlidersHorizontal,
  UsersRound,
  X,
} from "lucide-react";

import type { ContactListItem } from "@/lib/api/types";

import Button from "@/components/Button";
import Input from "@/components/Input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";
import Select from "@/components/Select";
import ContactCard from "./ContactCard";

type TypeFilter = "all" | "real" | "virtual";
type SortOption = "recent" | "oldest";

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "real", label: "Reales" },
  { value: "virtual", label: "Virtuales" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Más reciente primero" },
  { value: "oldest", label: "Más antiguo primero" },
];

const PAGE_SIZE = 20;

interface ContactListSectionProps {
  contacts: ContactListItem[];
}

const ContactListSection = ({ contacts }: ContactListSectionProps) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
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

  const clearFilters = () => {
    setTypeFilter("all");
  };

  const activeFilterCount = typeFilter !== "all" ? 1 : 0;

  const filteredContacts = useMemo(() => {
    let result = contacts;

    if (typeFilter !== "all") {
      result = result.filter((contact) =>
        typeFilter === "virtual" ? contact.isVirtual : !contact.isVirtual,
      );
    }

    const normalizedQuery = debouncedQuery.trim().toLowerCase();

    if (normalizedQuery) {
      result = result.filter((contact) =>
        [contact.name, contact.email, contact.contactEmail]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      );
    }

    return [...result].sort((a, b) => {
      const aTime = new Date(a.connectedAt).getTime();
      const bTime = new Date(b.connectedAt).getTime();

      return sortOption === "recent" ? bTime - aTime : aTime - bTime;
    });
  }, [contacts, typeFilter, debouncedQuery, sortOption]);

  // Any change to the search/filter/sort criteria narrows or reshuffles the
  // result set, so the progressive "load more on scroll" window has to
  // restart from the first page instead of keeping a stale count.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [typeFilter, debouncedQuery, sortOption]);

  const visibleContacts = useMemo(
    () => filteredContacts.slice(0, visibleCount),
    [filteredContacts, visibleCount],
  );

  const virtualizer = useWindowVirtualizer({
    count: visibleContacts.length > 0 ? visibleContacts.length : 1,
    estimateSize: () => 88.72,
    gap: 20,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const lastVirtualItemIndex = virtualItems.at(-1)?.index;

  useEffect(() => {
    if (lastVirtualItemIndex === undefined) return;

    const isNearEnd = lastVirtualItemIndex >= visibleContacts.length - 5;
    const hasMoreToReveal = visibleCount < filteredContacts.length;

    if (isNearEnd && hasMoreToReveal) {
      setVisibleCount((prev) =>
        Math.min(prev + PAGE_SIZE, filteredContacts.length),
      );
    }
  }, [
    lastVirtualItemIndex,
    visibleContacts.length,
    filteredContacts.length,
    visibleCount,
  ]);

  return (
    <section className="flex flex-1 flex-col gap-y-6">
      <p className="text-xl font-semibold">
        Contactos <span>({filteredContacts.length})</span>
      </p>

      <div className="relative z-20 flex flex-col gap-y-4 md:items-start md:gap-x-4 lg:flex-row">
        <div className="relative w-full">
          <Input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Buscar por nombre o email"
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
                <p className="text-sm font-semibold">Tipo</p>

                <div className="flex flex-wrap gap-2">
                  {TYPE_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => setTypeFilter(option.value)}
                      variant={
                        typeFilter === option.value ? "contained" : "outlined"
                      }
                      color={
                        typeFilter === option.value ? "primary" : "secondary"
                      }
                      className="!min-w-0 !px-3 !py-1.5 text-xs"
                    >
                      {option.label}
                    </Button>
                  ))}
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

      {contacts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center gap-y-4 pt-16 text-center">
          <UsersRound className="text-foreground/50 h-12 w-12" />

          <p className="text-foreground/75">
            Todavía no tenés contactos. Invitá a alguien por email a un gasto o
            grupo para empezar — cuando acepte, va a aparecer acá.
          </p>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center gap-y-4 pt-16 text-center">
          <SearchX className="text-foreground/50 h-12 w-12" />

          <p className="text-foreground/75">
            No encontramos contactos que coincidan con tu búsqueda o filtros.
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
            const contact = visibleContacts[virtualItem.index];

            if (!contact) return null;

            return (
              <div
                ref={virtualizer.measureElement}
                key={virtualItem.key}
                data-index={virtualItem.index}
                className="absolute top-0 left-0 w-full"
                style={{ transform: `translateY(${virtualItem.start}px)` }}
              >
                <ContactCard contact={contact} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ContactListSection;
