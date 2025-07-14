import { useState } from "react";

import clsx from "clsx";
import { Repeat } from "lucide-react";

import Button from "../Button";
import Collapse from "../Collapse";
import InputErrorMessage from "../InputErrorMessage";
import Tooltip from "../Tooltip";
import { GROUP_CATEGORIES, GROUP_TYPE, GROUP_TYPES } from "./constants";

interface GroupTypeSelectProps {
  label?: string;
  value?: GROUP_TYPE;
  onChange: (type?: GROUP_TYPE) => void;
  error?: string | null;
}

const GroupTypeSelect = ({
  label,
  value,
  onChange,
  error,
}: GroupTypeSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const type = value ?? GROUP_TYPE.OTHER;
  const Icon = GROUP_TYPES[type].icon;

  return (
    <div className="relative flex flex-col pt-7">
      {label && (
        <label
          className={clsx(
            "absolute left-0 transform font-semibold transition-all duration-300",
            !!value
              ? "text-primary translate-x-1 -translate-y-6 text-sm"
              : "text-md translate-x-3 translate-y-2.5 text-lg",
          )}
        >
          {label}
        </label>
      )}

      <div
        className={clsx(
          "text-foreground flex min-h-[50px] w-full justify-between gap-x-3 border-b p-3",
          value ? "border-primary" : "border-foreground",
        )}
      >
        <div className="flex gap-x-3">
          <div
            className={clsx(
              "flex h-6 w-6 items-center justify-center",
              GROUP_TYPES[type].color,
            )}
          >
            <Icon className="text-background h-3.5 w-3.5" />
          </div>

          <p>{GROUP_TYPES[type].label}</p>
        </div>

        <Button
          type="button"
          aria-label="Show group categories"
          onClick={() => setIsOpen((prevState) => !prevState)}
          unstyled
          className={clsx(
            "hover:text-primary flex cursor-pointer gap-x-3 transition-colors duration-300",
          )}
        >
          <Repeat className="h-6 w-6" />
        </Button>
      </div>

      <Collapse isOpen={isOpen}>
        <div className="flex flex-wrap justify-evenly py-3">
          {Object.values(GROUP_CATEGORIES).map((groupType) => {
            const Icon = GROUP_TYPES[groupType].icon;
            const isSelected = value === groupType;

            return (
              <Tooltip
                key={groupType}
                color="info"
                content={GROUP_TYPES[groupType].label}
              >
                <Button
                  type="button"
                  aria-label="Group icon"
                  onClick={() => {
                    onChange(isSelected ? undefined : groupType);
                    setIsOpen(false);
                  }}
                  variant={isSelected ? "contained" : "outlined"}
                  unstyled
                  className={clsx(
                    "text-background flex h-12.5 w-12.5 min-w-12.5 cursor-pointer items-center justify-center",
                    GROUP_TYPES[groupType].color,
                    isSelected && "animate-bg-color-pulse",
                  )}
                >
                  <Icon className="h-7 w-7" />
                </Button>
              </Tooltip>
            );
          })}
        </div>
      </Collapse>

      <InputErrorMessage message={error} />
    </div>
  );
};

export default GroupTypeSelect;
