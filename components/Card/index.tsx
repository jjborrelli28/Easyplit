"use client";

import { type FormEvent, type MouseEvent, useState } from "react";

import { useRouter } from "next/navigation";

import type { Session } from "next-auth";

import clsx from "clsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CircleChevronDown, Trash } from "lucide-react";

import useDeleteExpense from "@/hooks/expense/useDeleteExpense";
import useDeleteGroup from "@/hooks/group/useDeleteGroup";

import type { Expense, Group, ResponseMessage } from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";

import Badge from "../Badge";
import Button from "../Button";
import Collapse from "../Collapse";
import { EXPENSE_TYPE, EXPENSE_TYPES } from "../ExpenseTypeSelect/constants";
import { GROUP_TYPE, GROUP_TYPES } from "../GroupTypeSelect/constants";
import MessageCard from "../MessageCard";
import Modal from "../Modal";
import Tooltip from "../Tooltip";

export enum CARD_TYPE {
  EXPENSE = "EXPENSE",
  GROUP = "GROUP",
}

interface CardProps {
  type: CARD_TYPE;
  data: Expense | Group;
  loggedInUser?: Session["user"];
}

const Card = ({ type, data, loggedInUser }: CardProps) => {
  const router = useRouter();

  const { mutate: deleteExpense, isPending: expenseIsPending } =
    useDeleteExpense();
  const { mutate: deleteGroup, isPending: groupIsPending } = useDeleteGroup();

  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [participantsIsOpen, setParticipantsIsOpen] = useState(false);

  const [message, setMessage] = useState<ResponseMessage | null>(null);

  if (!data || !loggedInUser) return null;

  const handleClickCard = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const tagId = target.id;
    const tagName = (e.target as HTMLElement).tagName.toLowerCase();

    if (tagId === "icon" || tagId === "name" || tagName === "div")
      router.push(`/expense/${data.id}`);
  };

  const handleToggleCard = () =>
    setParticipantsIsOpen((prevState) => !prevState);

  const handleDelete = (e: FormEvent) => {
    e.preventDefault();

    const body = {
      data: {
        id: data.id,
      },
    };

    if (type === CARD_TYPE.EXPENSE) {
      deleteExpense(body, {
        onSuccess: (res) => {
          res?.message && setMessage(res.message);
        },
        onError: (res) => {
          const {
            error: { message },
          } = res.response.data;

          setMessage({
            color: "danger",
            icon: "CircleX",
            title: "No se puedo eliminar el gasto",
            content: message.map((paragraph) => ({
              text: paragraph,
            })),
          });
        },
      });
    } else {
      deleteGroup(body, {
        onSuccess: (res) => {
          res?.message && setMessage(res.message);
        },
        onError: (res) => {
          const {
            error: { message },
          } = res.response.data;

          setMessage({
            color: "danger",
            icon: "CircleX",
            title: "No se puedo eliminar el grupo",
            content: message.map((paragraph) => ({
              text: paragraph,
            })),
          });
        },
      });
    }
  };

  const Icon =
    type === CARD_TYPE.EXPENSE
      ? EXPENSE_TYPES[(data as Expense)?.type ?? EXPENSE_TYPE.UNCATEGORIZED]
          .icon
      : GROUP_TYPES[(data as Group)?.type ?? GROUP_TYPE.OTHER].icon;
  const participants =
    type === CARD_TYPE.EXPENSE
      ? (data as Expense).participants.filter(
          (participant) => participant.userId !== loggedInUser.id,
        )
      : (data as Group).members.filter(
          (member) => member.userId !== loggedInUser.id,
        );
  const IsUserCreator =
    type === CARD_TYPE.EXPENSE
      ? loggedInUser.id === (data as Expense).paidById
      : loggedInUser.id === (data as Group).createdById;
  const creatorUserName = IsUserCreator
    ? "mi"
    : type === CARD_TYPE.EXPENSE
      ? (data as Expense).paidBy.name
      : (data as Group).createdBy.name;
  const isDeleting = expenseIsPending || groupIsPending;

  return (
    <>
      <div
        onClick={handleClickCard}
        className="border-h-background group hover:border-primary flex cursor-pointer items-center gap-x-4 border p-4 transition-colors duration-300"
      >
        <div
          className={clsx(
            "flex h-14 w-14 items-center justify-center rounded-full",
            type === CARD_TYPE.EXPENSE
              ? EXPENSE_TYPES[
                  (data as Expense).type ?? EXPENSE_TYPE.UNCATEGORIZED
                ].color
              : GROUP_TYPES[(data as Group).type ?? GROUP_TYPE.OTHER].color,
          )}
        >
          <Icon id="icon" className="text-background h-8 w-8" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-y-2">
          <div className="flex flex-col gap-y-0.5">
            <div className="grid-rows-auto grid grid-cols-1 gap-x-4 lg:grid-cols-2 lg:grid-rows-1 lg:items-center">
              <Tooltip content={data.name} color="info">
                <p
                  id="name"
                  className="group-hover:text-primary truncate text-lg font-semibold transition-colors duration-300"
                >
                  {data.name}
                </p>
              </Tooltip>

              {type === CARD_TYPE.EXPENSE && (
                <Tooltip
                  content={`$${(data as Expense).amount}`}
                  color="info"
                  containerClassName="lg:justify-end"
                >
                  <span className="text-primary flex max-w-full cursor-default items-center gap-x-0.75 font-semibold">
                    <span className="text-sm">$</span>

                    <p className="truncate text-lg">
                      {(data as Expense).amount}
                    </p>
                  </span>
                </Tooltip>
              )}
            </div>

            <div>
              <p className="text-foreground/75 inline cursor-default text-xs">
                {type === CARD_TYPE.EXPENSE ? "Añadido" : "Creado"} por{" "}
                {creatorUserName} el{" "}
                {format(new Date(data.createdAt), "dd/MM/yyyy", { locale: es })}
              </p>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-x-4">
              <p className="text-info cursor-default text-xs font-semibold">
                Tu y{" "}
                {participants.length === 1
                  ? type === CARD_TYPE.EXPENSE
                    ? "un participante"
                    : "un miembro"
                  : `${participants.length} ${type === CARD_TYPE.EXPENSE ? "participantes" : "miembros"}`}{" "}
                más{" "}
                <Button
                  onClick={handleToggleCard}
                  aria-label="Show or hide participants"
                  unstyled
                  className="text-info hover:text-info/90 inline-block h-4 w-4 cursor-pointer align-middle transition-colors duration-300"
                >
                  <CircleChevronDown
                    className={clsx(
                      "h-4 w-4 transition-transform duration-300",
                      participantsIsOpen && "-rotate-180",
                    )}
                  />
                </Button>
              </p>

              {IsUserCreator && (
                <Button
                  onClick={() => setDeleteModalIsOpen(true)}
                  aria-label="Remove card"
                  unstyled
                  className="text-danger hover:text-danger/90 cursor-pointer transition-colors duration-300"
                >
                  <Trash className="h-5 w-5" />
                </Button>
              )}
            </div>

            <Collapse
              isOpen={participantsIsOpen}
              containerClassName={clsx(
                "flex flex-wrap gap-2 transition=[margin] duration-300",
                participantsIsOpen && "mt-2",
              )}
            >
              {participants.map((participant, i) => (
                <Badge key={i} color="info">
                  {participant.user.name}
                </Badge>
              ))}
            </Collapse>
          </div>
        </div>
      </div>

      <Modal
        isOpen={deleteModalIsOpen}
        onClose={() => setDeleteModalIsOpen(false)}
        showHeader={!message}
        title={`¿Estás seguro de que quieres eliminar este
                  ${type === CARD_TYPE.EXPENSE ? "gasto" : "grupo"}?`}
        unstyled={!!message}
      >
        {message ? (
          <MessageCard
            {...message}
            icon={ICON_MAP[message.icon]}
            countdown={{
              color: message.color,
              start: 3,
              onComplete: async () => {
                setDeleteModalIsOpen(false);
                setMessage(null);
              },
            }}
            className="w-md"
          >
            {message.content}
          </MessageCard>
        ) : (
          <>
            <div className="flex flex-col gap-y-8">
              <div className="flex flex-col gap-y-2">
                <p className="text-sm">
                  Esta acción eliminará tu{" "}
                  {type === CARD_TYPE.EXPENSE ? "gasto" : "grupo"}{" "}
                  <span className="font-semibold">{data.name}</span> de forma
                  permanente para todos los{" "}
                  {type === CARD_TYPE.EXPENSE
                    ? "participantes del mismo."
                    : "miembros del grupo."}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-y-4">
              <Button
                onClick={handleDelete}
                color="danger"
                loading={isDeleting}
                fullWidth
              >
                Eliminar {type === CARD_TYPE.EXPENSE ? "gasto" : "grupo"}
              </Button>

              <Button
                onClick={() => setDeleteModalIsOpen(false)}
                variant="outlined"
                color="secondary"
                fullWidth
              >
                Cancelar
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default Card;
