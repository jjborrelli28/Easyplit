import { useMemo, useState } from "react";

import Image from "next/image";

import { Check, Plus, X } from "lucide-react";

import type { User } from "@/lib/api/types";

import clsx from "clsx";
import Badge from "../Badge";
import Button from "../Button";
import InputErrorMessage from "../InputErrorMessage";
import Modal from "../Modal";
import Tooltip from "../Tooltip";
import UserSearchEngine, {
  type UserSearchEngineProps,
} from "../UserSearchEngine";

interface UserPickerProps
  extends Omit<UserSearchEngineProps, "onSelect" | "onChange"> {
  value: string[];
  onChange: (userIds: string[]) => void;
  onUserListChange?: (users: User[]) => void;
  modalTitle?: string;
  modalListTitle?: string;
  error?: string | null;
}

const UserPicker = ({
  label,
  user,
  value,
  onChange,
  onUserListChange,
  excludeUserIds = [],
  modalTitle = "Buscar usuario",
  modalListTitle = "Usuarios",
  error,
  ...restProps
}: UserPickerProps) => {
  const [users, setUsers] = useState<User[]>([user as User]);
  const [isOpen, setIsOpen] = useState(false);

  const selectedUserIds = useMemo(() => new Set(value), [value]);

  if (!user) return null;

  const updateUserList = (newUsers: User[]) => {
    setUsers(newUsers);
    onUserListChange?.(newUsers);
  };

  const handleSelect = (user: User) => {
    if (selectedUserIds.has(user.id)) return;

    const newUser = [...users, user];
    const newIds = newUser.map((p) => p.id);

    onChange(newIds);
    updateUserList(newUser);
  };

  const handleRemove = (userId: string) => {
    const newUser = users.filter((p) => p.id !== userId);
    const newIds = newUser.map((p) => p.id);

    onChange(newIds);
    updateUserList(newUser);
  };

  const handleCloseModal = () => setIsOpen(false);

  const selectedUsers = users.filter((p) => selectedUserIds.has(p.id));

  return (
    <>
      <div className="relative flex flex-col pt-7">
        {label && (
          <label
            className={clsx(
              "absolute left-0 transform font-semibold transition-all duration-300",
              !!value
                ? "translate-x-1 -translate-y-6 text-sm"
                : "text-md translate-x-3 translate-y-2.5 text-lg",
              value.length > 1 && "text-primary",
            )}
          >
            {label}
          </label>
        )}

        <div className="flex max-h-25 flex-wrap gap-2 overflow-y-scroll py-3">
          {selectedUsers.map((u) => (
            <Tooltip key={u.id} content={u.name ?? ""}>
              <Badge
                color="info"
                leftItem={
                  u.image && (
                    <Image
                      alt="User avatar"
                      src={u.image}
                      height={14}
                      width={14}
                      className="-ml-1.5 h-3.5 w-3.5 flex-shrink-0 rounded-full"
                    />
                  )
                }
                rightItem={
                  value.length > 1 && (
                    <Button
                      onClick={() => handleRemove(u.id)}
                      unstyled
                      className="border-background group-hover:border-background/90 cursor-pointer rounded-full transition-colors duration-300"
                    >
                      <X className="text-background group-hover:text-background/90 -mr-1 h-3.5 w-3.5 stroke-3 transition-colors duration-300" />
                    </Button>
                  )
                }
              >
                {u.id === user.id ? "Tu" : u.name}
              </Badge>
            </Tooltip>
          ))}

          <Tooltip content="Agregar participante">
            <Button
              type="button"
              onClick={() => setIsOpen(true)}
              unstyled
              className="bg-info hover:bg-info/90 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition-colors duration-300"
            >
              <Plus className="text-background h-3.5 w-3.5 stroke-3" />
            </Button>
          </Tooltip>
        </div>

        <InputErrorMessage message={error} />
      </div>

      <Modal isOpen={isOpen} onClose={handleCloseModal} title={modalTitle}>
        <UserSearchEngine
          user={user}
          onSelect={handleSelect}
          excludeUserIds={[...excludeUserIds, ...value]}
          {...restProps}
        />

        <div className="relative pt-7">
          <label
            className={clsx(
              "absolute left-0 transform font-semibold transition-all duration-300",
              !!value
                ? "translate-x-1 -translate-y-6 text-sm"
                : "text-md translate-x-3 translate-y-2.5 text-lg",
              value.length > 1 && "text-primary",
            )}
          >
            {modalListTitle}
          </label>

          <div className="flex max-h-50 flex-wrap gap-2 overflow-y-scroll pt-3">
            {selectedUsers.map((u) => (
              <Tooltip key={u.id} content={u.name}>
                <Badge
                  color="info"
                  leftItem={
                    u.image && (
                      <Image
                        alt="User avatar"
                        src={u.image}
                        height={14}
                        width={14}
                        className="-ml-1.5 h-3.5 w-3.5 flex-shrink-0 rounded-full"
                      />
                    )
                  }
                  rightItem={
                    value.length > 1 && (
                      <Button
                        onClick={() => handleRemove(u.id)}
                        unstyled
                        className="border-background group-hover:border-background/90 cursor-pointer rounded-full transition-colors duration-300"
                      >
                        <X className="text-background group-hover:text-background/90 -mr-1 h-3.5 w-3.5 stroke-3 transition-colors duration-300" />
                      </Button>
                    )
                  }
                >
                  {u.id === user.id ? "Tu" : u.name}
                </Badge>
              </Tooltip>
            ))}
          </div>
        </div>

        <Button onClick={handleCloseModal} variant="outlined" fullWidth>
          Listo <Check />
        </Button>
      </Modal>
    </>
  );
};

export default UserPicker;
