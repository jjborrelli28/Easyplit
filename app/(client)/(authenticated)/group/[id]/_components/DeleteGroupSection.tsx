import { type FormEvent, useState } from "react";

import { useRouter } from "next/navigation";

import useDeleteGroup from "@/hooks/data/group/useDeleteGroup";
import useSnackbar from "@/hooks/useSnackbar";

import type { ResponseMessage } from "@/lib/api/types";
import ICON_MAP from "@/lib/icons";

import Button from "@/components/Button";
import MessageCard from "@/components/MessageCard";
import Modal from "@/components/Modal";

interface DeleteAccountSectionProps {
  groupId: string;
}

const DeleteGroupSection = ({ groupId }: DeleteAccountSectionProps) => {
  const router = useRouter();
  const { mutate: deleteGroup, isPending } = useDeleteGroup(groupId);
  const { showSnackbar } = useSnackbar();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  // Only the success path sets this: it redirects away, so the countdown
  // gives the user a beat to see that's about to happen. Errors don't
  // redirect, so they go straight to a snackbar instead.
  const [message, setMessage] = useState<ResponseMessage | null>(null);

  const handleDelete = (e: FormEvent) => {
    e.preventDefault();

    deleteGroup(undefined, {
      onSuccess: (res) => {
        res?.message && setMessage(res.message);
      },
      onError: (res) => {
        const {
          error: { message },
        } = res.response.data;

        showSnackbar(message.join(" "), { color: "danger" });
        setModalIsOpen(false);
      },
    });
  };

  return (
    <>
      <section className="flex justify-end">
        <div className="w-full lg:w-auto">
          <Button
            aria-label="Remove group"
            onClick={() => setModalIsOpen(true)}
            color="danger"
            fullWidth
          >
            Eliminar grupo
          </Button>
        </div>
      </section>

      <Modal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        showHeader={!message}
        title="¿Estás seguro que querés eliminar el grupo?"
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
                  Esta acción eliminará tu grupo de forma permanente para todos
                  los miembros del mismo.
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
                Eliminar grupo
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

export default DeleteGroupSection;
