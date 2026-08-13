"use client";

import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";
import { Check, CircleChevronDown, X } from "lucide-react";

import useAcceptInvitation from "@/hooks/data/invitations/useAcceptInvitation";
import useGetMyInvitations from "@/hooks/data/invitations/useGetMyInvitations";
import useRejectInvitation from "@/hooks/data/invitations/useRejectInvitation";

import Button from "../Button";
import Collapse from "../Collapse";
import UserCard from "../UserCard";

// Must match the literal `max-h-[...]` class on the scrollable container
// below (Tailwind needs that value as a static string to generate the class).
const COLLAPSE_MAX_HEIGHT = 376;

const describeContext = (
  groups: { name: string }[],
  expenses: { name: string }[],
) => {
  const names = [...groups.map((g) => g.name), ...expenses.map((e) => e.name)];

  if (names.length === 0) return null;
  if (names.length === 1) return `Quiere agregarte a "${names[0]}"`;

  return `Quiere agregarte a ${names.length} gastos/grupos`;
};

const PendingInvitations = () => {
  const { data: invitations = [] } = useGetMyInvitations();
  const { mutate: acceptInvitation, isPending: isAccepting } =
    useAcceptInvitation();
  const { mutate: rejectInvitation, isPending: isRejecting } =
    useRejectInvitation();
  const queryClient = useQueryClient();

  const [listIsOpen, setListIsOpen] = useState(true);

  const virtualizer = useWindowVirtualizer({
    count: invitations.length > 0 ? invitations.length : 1,
    estimateSize: () => 679.81,
    gap: 20,
    overscan: 3,
  });

  if (invitations.length === 0) return null;

  const hasOverflow = virtualizer.getTotalSize() > COLLAPSE_MAX_HEIGHT;

  const handleToggleList = () => {
    setListIsOpen((prevState) => !prevState);
  };

  const handleAccept = (id: string) => {
    acceptInvitation(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
        queryClient.invalidateQueries({ queryKey: ["my-expenses-and-groups"] });
      },
    });
  };

  const handleReject = (id: string) => {
    rejectInvitation(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
      },
    });
  };

  return (
    <section className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Solicitudes de contacto</h2>

        <Button
          aria-label="Toggle show panel list"
          onClick={handleToggleList}
          unstyled
          className="hover:text-foreground/90 inline-block h-6 w-6 cursor-pointer align-middle transition-colors duration-300"
        >
          <CircleChevronDown
            className={clsx(
              "h-6 w-6 transition-transform duration-300",
              listIsOpen && "-rotate-180",
            )}
          />
        </Button>
      </div>

      <div className="relative">
        <div className="max-h-[376px] overflow-y-auto">
          <Collapse
            isOpen={listIsOpen}
            contentClassName="flex flex-1 flex-col gap-y-4"
            contentStyle={{
              height: `${listIsOpen ? virtualizer.getTotalSize() : 0}px`,
            }}
          >
            <div
              className="border-box relative flex w-full min-w-0 flex-1 flex-col overflow-hidden"
              style={{
                height: `${virtualizer.getTotalSize()}px`,
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const item = invitations[virtualRow.index];

                return (
                  <div
                    ref={virtualizer.measureElement}
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    className="absolute top-0 left-0 w-full"
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div
                      key={item.id}
                      className="border-h-background grid grid-cols-1 gap-4 border p-4 sm:flex-row sm:items-center sm:justify-between md:grid-cols-2"
                    >
                      <div className="flex flex-col gap-y-4">
                        <UserCard
                          id={item.inviter.id}
                          name={item.inviter.name}
                          image={item.inviter.image}
                        />

                        <p className="text-foreground/75 text-sm">
                          {describeContext(item.groups, item.expenses)}
                        </p>
                      </div>

                      <div className="flex flex-wrap justify-end gap-4">
                        <Button
                          color="success"
                          onClick={() => handleAccept(item.id)}
                          loading={isAccepting}
                          className="w-32 max-w-full justify-start"
                        >
                          <Check className="h-4 w-4 stroke-3" /> Aceptar
                        </Button>

                        <Button
                          color="danger"
                          onClick={() => handleReject(item.id)}
                          loading={isRejecting}
                          className="w-32"
                        >
                          <X className="h-4 w-4 min-w-4 stroke-3" /> Rechazar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Collapse>
        </div>

        <div
          aria-hidden
          className={clsx(
            "from-background pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t to-transparent transition-opacity duration-300",
            hasOverflow && listIsOpen ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    </section>
  );
};

export default PendingInvitations;
