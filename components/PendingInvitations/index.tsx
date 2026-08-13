"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";

import useAcceptInvitation from "@/hooks/data/invitations/useAcceptInvitation";
import useGetMyInvitations from "@/hooks/data/invitations/useGetMyInvitations";
import useRejectInvitation from "@/hooks/data/invitations/useRejectInvitation";

import Button from "../Button";
import UserCard from "../UserCard";

const describeContext = (
  groups: { name: string }[],
  expenses: { name: string }[],
) => {
  const names = [...groups.map((g) => g.name), ...expenses.map((e) => e.name)];

  if (names.length === 0) return null;
  if (names.length === 1) return `Te invitó a "${names[0]}"`;

  return `Te invitó a ${names.length} gastos/grupos`;
};

const PendingInvitations = () => {
  const { data: invitations = [] } = useGetMyInvitations();
  const { mutate: acceptInvitation, isPending: isAccepting } =
    useAcceptInvitation();
  const { mutate: rejectInvitation, isPending: isRejecting } =
    useRejectInvitation();
  const queryClient = useQueryClient();

  if (invitations.length === 0) return null;

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
      <h2 className="text-xl font-bold">Invitaciones pendientes</h2>

      <div className="flex flex-col gap-y-4">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="border-h-background flex flex-col gap-y-4 border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-y-4">
              <UserCard
                id={invitation.inviter.id}
                name={invitation.inviter.name}
                image={invitation.inviter.image}
              />

              <p className="text-foreground/75 text-sm">
                {describeContext(invitation.groups, invitation.expenses)}
              </p>
            </div>

            <div className="flex justify-end gap-x-4">
              <Button
                color="success"
                onClick={() => handleAccept(invitation.id)}
                loading={isAccepting}
              >
                <Check className="h-4 w-4" /> Aceptar
              </Button>

              <Button
                color="danger"
                
                onClick={() => handleReject(invitation.id)}
                loading={isRejecting}
              >
                <X className="h-4 w-4" /> Rechazar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PendingInvitations;
