"use client";

import {
  type CSSProperties,
  type FormEvent,
  type MouseEvent,
  Ref,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import type { Session } from "next-auth";

import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle, CircleChevronDown, Clock, Trash } from "lucide-react";

import useDeleteExpense from "@/hooks/data/expense/useDeleteExpense";
import useDeleteGroup from "@/hooks/data/group/useDeleteGroup";

import type { Expense, Group, ResponseMessage } from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";
import { areAllDebtsSettled, formatAmount } from "@/lib/utils";

import AmountNumber from "../AmountNumber";
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
  ref?: Ref<HTMLDivElement>;
  type: CARD_TYPE;
  data: Expense | Group;
  loggedInUser?: Session["user"];
  containerClassName?: string;
  containerStyle?: CSSProperties;
}

const Card = ({
  ref,
  type,
  data,
  loggedInUser,
  containerClassName,
  containerStyle,
}: CardProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: deleteExpense, isPending: expenseIsPending } =
    useDeleteExpense(data.id);
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
      type === CARD_TYPE.EXPENSE
        ? router.push(`/expense/${data.id}`)
        : router.push(`/group/${data.id}`);
  };

  const handleToggleCard = () =>
    setParticipantsIsOpen((prevState) => !prevState);

  const handleDelete = (e: FormEvent) => {
    e.preventDefault();

    if (type === CARD_TYPE.EXPENSE) {
      deleteExpense(undefined, {
        onSuccess: (res) => {
          queryClient.invalidateQueries({
            queryKey: ["my-expenses-and-groups", loggedInUser.id!],
          });

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
      deleteGroup(
        {
          data: {
            id: data.id,
          },
        },
        {
          onSuccess: (res) => {
            queryClient.invalidateQueries({
              queryKey: ["my-expenses-and-groups", loggedInUser.id!],
            });

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
        },
      );
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
      ? (data as Expense).createdBy?.name
      : (data as Group).createdBy.name;
  const isDeleting = expenseIsPending || groupIsPending;
  const allDebtsSettled =
    type === CARD_TYPE.EXPENSE && areAllDebtsSettled(data as Expense);

  return (
    <>
      <div
        ref={ref}
        onClick={handleClickCard}
        className={clsx(
          "border-h-background group hover:border-primary flex cursor-pointer items-center gap-x-4 border p-4 transition-colors duration-300",
          containerClassName,
        )}
        style={containerStyle}
      >
        <div
          className={clsx(
            "flex h-14 w-14 items-center justify-center",
            type === CARD_TYPE.EXPENSE
              ? [
                  EXPENSE_TYPES[
                    (data as Expense).type ?? EXPENSE_TYPE.UNCATEGORIZED
                  ].color,
                  "rounded-full",
                ]
              : GROUP_TYPES[(data as Group).type ?? GROUP_TYPE.OTHER].color,
          )}
        >
          <Icon id="icon" className="text-background h-8 w-8" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-y-2">
          <div className="flex flex-col gap-y-0.5">
            <div className="grid-rows-auto grid grid-cols-1 gap-x-4 lg:grid-cols-[1fr_auto] lg:grid-rows-1 lg:items-center">
              <div className="flex items-center gap-x-2 truncate">
                <Tooltip
                  content={data.name}
                  color="info"
                  containerClassName="truncate max-w-full"
                >
                  <span
                    id="name"
                    className="group-hover:text-primary truncate text-lg font-semibold transition-colors duration-300"
                  >
                    {data.name}
                  </span>
                </Tooltip>

                {type === CARD_TYPE.EXPENSE && (
                  <Tooltip
                    color="info"
                    content={allDebtsSettled ? "Gasto completo" : "Incompleto"}
                  >
                    <Badge
                      color={allDebtsSettled ? "success" : "warning"}
                      className="!px-1"
                    >
                      {allDebtsSettled ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                    </Badge>
                  </Tooltip>
                )}
              </div>

              {type === CARD_TYPE.EXPENSE && (
                <div className="flex justify-end">
                  <Tooltip
                    content={
                      <AmountNumber size="xs">
                        {formatAmount((data as Expense).amount)}
                      </AmountNumber>
                    }
                    color="info"
                    containerClassName="lg:justify-end"
                  >
                    <AmountNumber size="lg" className="text-primary">
                      {formatAmount((data as Expense).amount)}
                    </AmountNumber>
                  </Tooltip>
                </div>
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
                  aria-label="Toggle show participants"
                  onClick={handleToggleCard}
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
                  aria-label="Remove card"
                  onClick={() => setDeleteModalIsOpen(true)}
                  unstyled
                  className="text-danger hover:text-danger/90 cursor-pointer transition-colors duration-300"
                >
                  <Trash className="h-5 w-5" />
                </Button>
              )}
            </div>

            <Collapse
              isOpen={participantsIsOpen}
              contentClassName={clsx(
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
