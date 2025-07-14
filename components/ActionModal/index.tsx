import { useState } from "react";

import Image from "next/image";

import type { Session } from "next-auth";

import type { User } from "@/lib/api/types";

import Modal, { type ModalProps } from "../Modal";
import ExpenseForm from "./components/ExpenseForm";
import GroupForm from "./components/GroupForm";
import clsx from "clsx";

export enum ACTION_TYPE {
  CREATE_EXPENSE = "CREATE_EXPENSE",
  CREATE_GROUP = "CREATE_GROUP",
}

interface ActionModalProps extends Omit<ModalProps, "children"> {
  type: ACTION_TYPE | null;
  user?: Session["user"];
}

const ActionModal = ({
  type,
  user,
  onClose,
  ...restProps
}: ActionModalProps) => {
  const [showHeader, setShowHeader] = useState(true);

  if (!user) return null;

  const handleShowModalHeader = (state: boolean) => setShowHeader(state);

  return (
    <Modal
      {...restProps}
      onClose={onClose}
      title={
        type === ACTION_TYPE.CREATE_EXPENSE
          ? "Crear un gasto"
          : "Crear un grupo"
      }
      showHeader={showHeader}
      unstyled={!showHeader}
      className={clsx(
        "!gap-y-4 lg:!gap-y-8",
        type === ACTION_TYPE.CREATE_EXPENSE && "lg:!w-3xl lg:!max-w-3xl",
      )}
    >
      {type === ACTION_TYPE.CREATE_EXPENSE && (
        <ExpenseForm
          user={user}
          onClose={onClose}
          handleShowModalHeader={handleShowModalHeader}
        />
      )}

      {type === ACTION_TYPE.CREATE_GROUP && (
        <GroupForm
          user={user}
          onClose={onClose}
          handleShowModalHeader={handleShowModalHeader}
        />
      )}
    </Modal>
  );
};

export default ActionModal;

export const getParticipantOptions = (participants: User[]) =>
  participants.map(
    (participant) =>
      participant && {
        value: participant.id,
        label: (
          <div className="flex items-center gap-x-3 truncate">
            {participant.image && (
              <div className="relative h-6 w-6">
                <Image
                  alt="User avatar"
                  src={participant.image}
                  height={24}
                  width={24}
                  className="h-6 w-6 flex-shrink-0 rounded-full"
                />
              </div>
            )}
            {participant.name} {"hasPassword" in participant && "(Tu)"}
          </div>
        ),
      },
  );
