"use client";

import { useState } from "react";

import Image from "next/image";

import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, Trash } from "lucide-react";

import useDeleteContact from "@/hooks/data/user/useDeleteContact";
import useDeleteVirtualUser from "@/hooks/data/user/useDeleteVirtualUser";
import useSnackbar from "@/hooks/useSnackbar";

import type { ContactListItem } from "@/lib/api/types";

import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Tooltip from "@/components/Tooltip";

interface ContactCardProps {
  contact: ContactListItem;
}

const ContactCard = ({ contact }: ContactCardProps) => {
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);

  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { mutate: deleteContact, isPending: isDeletingContact } =
    useDeleteContact();
  const { mutate: deleteVirtualUser, isPending: isDeletingVirtualUser } =
    useDeleteVirtualUser();

  const isVirtual = !!contact.isVirtual;
  const isDeleting = isDeletingContact || isDeletingVirtualUser;

  const handleDelete = () => {
    const mutate = isVirtual ? deleteVirtualUser : deleteContact;

    mutate(contact.id, {
      onSuccess: (res) => {
        queryClient.invalidateQueries({ queryKey: ["contacts"] });

        if (isVirtual) {
          queryClient.invalidateQueries({
            queryKey: ["my-expenses-and-groups"],
          });
        }

        if (res?.message) {
          showSnackbar(res.message.title as string, {
            color: res.message.color,
          });
        }

        setDeleteModalIsOpen(false);
      },
      onError: (res) => {
        const {
          error: { message },
        } = res.response.data;

        showSnackbar(message.join(" "), { color: "danger" });
        setDeleteModalIsOpen(false);
      },
    });
  };

  return (
    <>
      <div className="border-h-background flex w-full items-center gap-x-4 border p-4">
        {contact.image && (
          <Image
            alt="Avatar"
            src={contact.image}
            height={56}
            width={56}
            className="h-14 w-14 min-w-14 rounded-full"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-y-1">
          <div className="flex items-center gap-x-2">
            <Tooltip
              content={contact.name}
              color="info"
              containerClassName="truncate max-w-full"
            >
              <span className="truncate text-lg font-semibold">
                {contact.name}
              </span>
            </Tooltip>

            {isVirtual && (
              <Tooltip color="secondary" content={`${contact.name} (virtual)`}>
                <Badge color="secondary" className="!px-2 text-xs">
                  Virtual
                </Badge>
              </Tooltip>
            )}

            {contact.pending && (
              <Tooltip color="warning" content="Todavía no aceptó la solicitud">
                <Badge color="warning" className="!px-1">
                  <Clock className="h-3.5 w-3.5" />
                </Badge>
              </Tooltip>
            )}
          </div>

          <p className="text-foreground/75 text-xs">
            {isVirtual ? "Usuario virtual creado el " : "Contacto desde el "}
            {format(new Date(contact.connectedAt), "dd/MM/yyyy", {
              locale: es,
            })}
          </p>
        </div>

        <Button
          aria-label="Remove contact"
          onClick={() => setDeleteModalIsOpen(true)}
          unstyled
          className="text-danger hover:text-danger/90 cursor-pointer transition-colors duration-300"
        >
          <Tooltip
            color="info"
            content={isVirtual ? "Eliminar usuario virtual" : "Eliminar contacto"}
          >
            <Trash className="h-5 w-5" />
          </Tooltip>
        </Button>
      </div>

      <Modal
        isOpen={deleteModalIsOpen}
        onClose={() => setDeleteModalIsOpen(false)}
        title={
          isVirtual
            ? `¿Eliminar a ${contact.name}?`
            : `¿Eliminar a ${contact.name} de tus contactos?`
        }
      >
        <div className="flex flex-col gap-y-2">
          <p className="text-sm">
            {isVirtual
              ? "Esta acción lo eliminará de todos los grupos y gastos en los que participa, lo cual puede afectar los balances de las personas involucradas. Esta acción no se puede deshacer."
              : "Van a dejar de ser contactos. Los gastos y grupos que ya comparten no se ven afectados, pero si querés agregarlo de nuevo a algo vas a tener que volver a enviarle una solicitud."}
          </p>
        </div>

        <div className="flex flex-col gap-y-4">
          <Button
            onClick={handleDelete}
            color="danger"
            loading={isDeleting}
            fullWidth
          >
            {isVirtual ? "Eliminar usuario" : "Eliminar contacto"}
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
      </Modal>
    </>
  );
};

export default ContactCard;
