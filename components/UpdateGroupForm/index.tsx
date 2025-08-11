import type { Dispatch, SetStateAction } from "react";

import type { Session } from "next-auth";

import type { Group, User } from "@/lib/api/types";

interface UpdateGroupFormProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  expense: Group;
  user: Session["user"];
  fieldsToUpdate: string[]; // TODO
  memberToRemove?: User;
  selectedMember?: User | null;
}

const UpdateGroupForm = ({
  isOpen,
  setIsOpen,
  expense,
  user,
  fieldsToUpdate,
  memberToRemove,
  selectedMember,
}: UpdateGroupFormProps) => {
  console.log(
    isOpen,
    setIsOpen,
    expense,
    user,
    fieldsToUpdate,
    memberToRemove,
    selectedMember,
  );

  return <div>UpdateGroupForm</div>;
};

export default UpdateGroupForm;
