import { type FormEvent, useState } from "react";

import { Session } from "next-auth";

import clsx from "clsx";
import { CircleChevronDown, Receipt, Trash, Users } from "lucide-react";

import useDeleteExpense from "@/hooks/expenses/useDeleteExpense";

import type { ExpenseData, GroupData, ResponseMessage } from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";

import useDeleteGroup from "@/hooks/groups/useDeleteGroup";
import Badge from "../Badge";
import Button from "../Button";
import Collapse from "../Collapse";
import MessageCard from "../MessageCard";
import Modal from "../Modal";
import Tooltip from "../Tooltip";

export enum CARD_TYPE {
  EXPENSE = "EXPENSE",
  GROUP = "GROUP",
}

interface CardProps {
  type: CARD_TYPE;
  data: ExpenseData | GroupData;
  loggedInUser?: Session["user"];
}

const Card = ({ type, data, loggedInUser }: CardProps) => {
  const { mutate: deleteExpense, isPending: expenseIsPending } =
    useDeleteExpense();
  const { mutate: deleteGroup, isPending: groupIsPending } = useDeleteGroup();

  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [participantsIsOpen, setParticipantsIsOpen] = useState(false);

  const [message, setMessage] = useState<ResponseMessage | null>(null);

  if (!data || !loggedInUser) return null;

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

  const Icon = type === CARD_TYPE.EXPENSE ? Receipt : Users;
  const participants =
    type === CARD_TYPE.EXPENSE
      ? (data as ExpenseData).participants.filter(
          (participant) => participant.userId !== loggedInUser.id,
        )
      : (data as GroupData).members.filter(
          (member) => member.userId !== loggedInUser.id,
        );
  const IsUserCreator =
    type === CARD_TYPE.EXPENSE
      ? loggedInUser.id === (data as ExpenseData).paidById
      : loggedInUser.id === (data as GroupData).createdById;
  const isDeleting = expenseIsPending || groupIsPending;

  return (
    <>
      <div className="border-h-background group hover:border-primary flex cursor-pointer gap-x-4 border p-4 transition-colors duration-300">
        <Icon className="group-hover:text-primary h-14 w-14 min-w-14 transition-colors duration-300" />

        <div className="flex min-w-0 flex-1 flex-col gap-y-2">
          <div className="flex flex-col justify-between gap-x-4 lg:flex-row lg:items-center">
            <Tooltip
              content={data.name}
              color="info"
              containerClassName="max-w-1/2 truncate"
            >
              <p className="group-hover:text-primary truncate text-lg font-semibold transition-colors duration-300 lg:w-fit">
                {data.name}
              </p>
            </Tooltip>

            {type === CARD_TYPE.EXPENSE && (
              <Tooltip
                content={`$${(data as ExpenseData).amount}`}
                color="info"
                containerClassName="max-w-1/2 truncate"
              >
                <p className="text-primary truncate text-lg font-semibold">
                  ${(data as ExpenseData).amount}
                </p>
              </Tooltip>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-x-4">
              <p className="text-info text-xs font-semibold">
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

            <div className="flex justify-end gap-x-4">
              <Button
                onClick={() => setDeleteModalIsOpen(false)}
                variant="outlined"
                color="secondary"
              >
                Cancelar
              </Button>

              <Button
                onClick={handleDelete}
                color="danger"
                loading={isDeleting}
                className="min-w-40"
              >
                Eliminar {type === CARD_TYPE.EXPENSE ? "gasto" : "grupo"}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default Card;
