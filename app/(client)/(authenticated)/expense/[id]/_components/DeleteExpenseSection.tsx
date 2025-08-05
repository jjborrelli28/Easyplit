import { type FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

import useDeleteExpense from "@/hooks/data/expense/useDeleteExpense";

import type { ResponseMessage } from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";

import Button from "@/components/Button";
import MessageCard from "@/components/MessageCard";
import Modal from "@/components/Modal";

interface DeleteAccountSectionProps {
  expenseId: string;
}

const DeleteExpenseSection = ({ expenseId }: DeleteAccountSectionProps) => {
  const router = useRouter();
  const { mutate: deleteExpense, isPending } = useDeleteExpense(expenseId);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [message, setMessage] = useState<ResponseMessage | null>(null);

  const handleDelete = (e: FormEvent) => {
    e.preventDefault();

    deleteExpense(undefined, {
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
  };

  return (
    <>
      <section className="flex justify-end">
        <div className="w-full lg:w-auto">
          <Button
            aria-label="Remove expense"
            onClick={() => setModalIsOpen(true)}
            color="danger"
            fullWidth
          >
            Eliminar gasto
          </Button>
        </div>
      </section>

      <Modal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        showHeader={!message}
        title="¿Estás seguro que querés eliminar el gasto?"
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
                setModalIsOpen(false);
                setMessage(null);
                router.push("/dashboard");
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
                  Esta acción eliminará tu gasto de forma permanente para todos
                  los participantes del mismo.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-y-4">
              <Button
                onClick={handleDelete}
                color="danger"
                loading={isPending}
                fullWidth
              >
                Eliminar gasto
              </Button>

              <Button
                onClick={() => setModalIsOpen(false)}
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

export default DeleteExpenseSection;
