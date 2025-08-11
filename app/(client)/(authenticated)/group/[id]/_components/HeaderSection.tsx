import { useState } from "react";

import Image from "next/image";

import type { Session } from "next-auth";

import clsx from "clsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarArrowUp, Repeat, UsersRound } from "lucide-react";

import type { Group } from "@/lib/api/types";
import {
  getTotalAmountOfExpenses,
  getTotalPaidByParticipants,
} from "@/lib/utils";

import Badge from "@/components/Badge";
import Button from "@/components/Button";
import PaymentDonutChart from "@/components/Charts/PaymentDonutChart";
import {
  GROUP_TYPE,
  GROUP_TYPES,
} from "@/components/GroupTypeSelect/constants";
import Tooltip from "@/components/Tooltip";
import UpdateGroupForm from "@/components/UpdateGroupForm";

interface HeaderSectionProps {
  group: Group;
  loggedUser: Session["user"];
}

const HeaderSection = ({ group, loggedUser }: HeaderSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fieldsToUpdate, setFieldsToUpdate] = useState<string[]>([]);

  const type = group?.type ?? GROUP_TYPE.OTHER;
  const Icon = GROUP_TYPES[type].icon;
  const totalAmount = getTotalAmountOfExpenses(group?.expenses);
  const totalPaid = getTotalPaidByParticipants(group?.expenses);
  const isUserEditor = loggedUser?.id === group?.createdById;

  return (
    <>
      <section className="flex flex-col items-center gap-x-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex w-full xl:w-fit xl:max-w-[calc(100%_-_220px)]">
          <div className="grid grid-cols-1 items-center justify-center gap-y-4 2xl:grid-cols-[1fr_auto] 2xl:gap-8">
            <div className="flex max-w-full min-w-0 items-center gap-x-4">
              <div
                className={clsx(
                  "group relative flex h-14 w-14 min-w-14 items-center justify-center rounded-full",
                  GROUP_TYPES[type].color,
                )}
              >
                <Icon className="text-background h-8 w-8" />

                {isUserEditor && (
                  <Button
                    aria-label="Change expense type"
                    onClick={() => {
                      setFieldsToUpdate(["type"]);
                      setIsOpen(true);
                    }}
                    unstyled
                    className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/75 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  >
                    <Repeat className="group-hover:text-primary h-8 w-8 text-transparent transition-colors duration-300" />
                  </Button>
                )}
              </div>

              <div className="group flex min-w-0 items-center gap-2">
                <h1 className="truncate text-3xl font-bold">{group.name}</h1>

                {isUserEditor && (
                  <Button
                    aria-label="Change payment date"
                    onClick={() => {
                      setFieldsToUpdate(["name"]);
                      setIsOpen(true);
                    }}
                    unstyled
                    className="group-hover:text-primary transition-colors duration-300 group-hover:cursor-pointer"
                  >
                    <Tooltip
                      color="info"
                      content="Modificar nombre"
                      containerClassName="!flex"
                    >
                      <Repeat className="h-5 w-5" />
                    </Tooltip>
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-y-2 2xl:col-span-2">
              <div className="text-foreground/75 flex items-center gap-x-2">
                <CalendarArrowUp className="h-5 w-5" />

                <p className="text-sm">
                  Creado por{" "}
                  <span className="font-semibold">{group.createdBy?.name}</span>{" "}
                  el{" "}
                  <span className="font-semibold">
                    {format(
                      new Date(group.createdAt),
                      "dd 'de' MMMM 'del' yyyy",
                      {
                        locale: es,
                      },
                    )}
                  </span>
                </p>
              </div>

              <div className="text-foreground/75 flex items-center gap-x-2">
                <UsersRound className="h-5 w-5" />
                <p className="text-sm">Miembros:</p>{" "}
              </div>

              <div className="flex flex-wrap gap-2">
                {group.members.map((member) => (
                  <Tooltip
                    key={member.id}
                    color="info"
                    content={member.user.name}
                  >
                    <Badge
                      className={GROUP_TYPES[group.type ?? "OTHER"].color}
                      leftItem={
                        member.user.image && (
                          <Image
                            alt="User avatar"
                            src={member.user.image}
                            height={14}
                            width={14}
                            className="-ml-1.5 h-3.5 w-3.5 flex-shrink-0 rounded-full"
                          />
                        )
                      }
                    >
                      {member.userId === loggedUser.id
                        ? "Tu"
                        : member.user.name}
                    </Badge>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
        </div>

        {totalAmount && (
          <PaymentDonutChart
            totalLabel="Pendiente"
            total={totalAmount}
            paidLabel="Cubierto"
            paid={totalPaid}
          />
        )}
      </section>

      {group && loggedUser && (
        <UpdateGroupForm
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          expense={group}
          user={loggedUser}
          fieldsToUpdate={fieldsToUpdate}
        />
      )}
    </>
  );
};

export default HeaderSection;
