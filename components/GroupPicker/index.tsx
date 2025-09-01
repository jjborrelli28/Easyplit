import { useEffect, useState } from "react";

import clsx from "clsx";
import { Check, Trash } from "lucide-react";

import type { Group } from "@/hooks/data/groups/useSearchGroups";

import type { User } from "@/lib/api/types";
import { compareMembers } from "@/lib/utils";

import Button from "../Button";
import FormErrorMessage from "../FormErrorMessage";
import GroupSearchEngine, {
  type GroupSearchEngineProps,
} from "../GroupSearchEngine";
import { GROUP_TYPE, GROUP_TYPES } from "../GroupTypeSelect/constants";
import InputErrorMessage from "../InputErrorMessage";
import Modal from "../Modal";

interface GroupPickerProps
  extends Omit<GroupSearchEngineProps, "onChange" | "onSelect"> {
  version?: "v1" | "v2";
  value?: string;
  onChange: (groupId?: string) => void;
  pickedParticipants?: User[];
  onPick?: VoidFunction;
}

const GroupPicker = ({
  version = "v1",
  value,
  onChange,
  pickedParticipants,
  error,
  containerClassName,
}: GroupPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [message, setMessage] = useState<string[] | null>(null);

  useEffect(() => {
    if (!value) {
      setSelectedGroup(null);
    }
  }, [value]);

  const handleSelect = (group: Group) => {
    const { haveDifferences, differences } = compareMembers(
      pickedParticipants,
      group?.members,
    );

    if (haveDifferences && differences.excessParticipants.length > 0) {
      setMessage(["Los participantes del gasto deben ser miembros del grupo."]);
    }

    setSelectedGroup(group);
    onChange(group.id);
  };

  const handleRemove = () => {
    setSelectedGroup(null);
    onChange("");
    setMessage(null);
  };

  const handleCloseModal = () => {
    if (!!message) {
      handleRemove();
    }

    setIsOpen(false);
  };

  const excludeGroupIds = value ? [value] : [];

  const content = (
    <>
      <GroupSearchEngine
        onSelect={handleSelect}
        excludeGroupIds={excludeGroupIds}
      />
      {selectedGroup && !!value && (
        <div className="relative pt-7">
          <label
            className={clsx(
              "absolute left-0 transform font-semibold transition-all duration-300",
              !!value
                ? "translate-x-1 -translate-y-6 text-sm"
                : "text-md translate-x-3 translate-y-2.5 text-lg",
              value?.length > 1 && "text-primary",
            )}
          >
            Grupo seleccionado:
          </label>

          <GroupCard data={selectedGroup} handleRemove={handleRemove} />

          <FormErrorMessage message={message} />
        </div>
      )}
    </>
  );

  return (
    <>
      {version === "v1" ? (
        <>
          <div className={clsx("flex flex-col", containerClassName)}>
            {selectedGroup ? (
              <div className="relative flex flex-col pt-7">
                <label className="text-primary absolute left-0 translate-x-1 -translate-y-6 transform text-sm font-semibold">
                  Grupo seleccionado:
                </label>

                <GroupCard
                  data={selectedGroup}
                  handleRemove={handleRemove}
                  className="border-primary border-b"
                />
              </div>
            ) : (
              <p className="py-2 text-sm">
                ¿Querés vincular el gasto a un grupo existente?{" "}
                <Button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  unstyled
                  className="hover:text-primary cursor-pointer font-semibold transition-colors duration-300"
                >
                  Hacé clic acá
                </Button>
              </p>
            )}

            <InputErrorMessage message={error} />
          </div>

          <Modal
            isOpen={isOpen}
            onClose={handleCloseModal}
            title="Buscar grupo"
          >
            {content}

            <Button
              onClick={handleCloseModal}
              disabled={!!message}
              color={!!message ? "secondary" : "primary"}
              fullWidth
            >
              Listo <Check />
            </Button>
          </Modal>
        </>
      ) : (
        <div className={clsx("flex flex-col gap-y-1", containerClassName)}>
          {content}

          <InputErrorMessage message={error} />
        </div>
      )}
    </>
  );
};

export default GroupPicker;

const GroupCard = ({
  data,
  handleRemove,
  className,
}: {
  data: Group;
  handleRemove: VoidFunction;
  className?: string;
}) => {
  const type = data?.type ?? GROUP_TYPE.OTHER;
  const Icon = GROUP_TYPES[type].icon;

  return (
    <div
      className={clsx(
        "text-foreground flex min-h-[50px] w-full justify-between gap-x-3 p-3",
        className,
      )}
    >
      <div
        className={clsx(
          "flex h-6 w-6 min-w-6 items-center justify-center rounded-full",
          GROUP_TYPES[type].color,
        )}
      >
        <Icon className="text-background h-3.5 w-3.5" />
      </div>

      <p className="w-full truncate">{data.name}</p>

      <Button
        aria-label="Remove selected group"
        onClick={handleRemove}
        unstyled
        className="text-danger hover:text-danger/90 cursor-pointer transition-colors duration-300"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};
