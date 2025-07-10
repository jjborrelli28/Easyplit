import clsx from "clsx";
import {
  Component,
  Handshake,
  Heart,
  House,
  Plane,
  UsersRound,
} from "lucide-react";

import Button from "../Button";
import Collapse from "../Collapse";
import Tooltip from "../Tooltip";

export enum GROUP_TYPE {
  HOUSEHOLD = "HOUSEHOLD",
  TRIP = "TRIP",
  FRIENDS = "FRIENDS",
  COUPLE = "COUPLE",
  FAMILY = "FAMILY",
  OTHER = "OTHER",
}

export const options = [
  { type: GROUP_TYPE.HOUSEHOLD, icon: House, label: "Hogar" },
  { type: GROUP_TYPE.TRIP, icon: Plane, label: "Viaje" },
  { type: GROUP_TYPE.FRIENDS, icon: Handshake, label: "Amigos" },
  { type: GROUP_TYPE.COUPLE, icon: Heart, label: "Pareja" },
  { type: GROUP_TYPE.FAMILY, icon: UsersRound, label: "Familia" },
  { type: GROUP_TYPE.OTHER, icon: Component, label: "Otro" },
];

interface GroupTypeSelectProps {
  value?: GROUP_TYPE;
  onChange: (type?: GROUP_TYPE) => void;
  error?: string | null;
}

const GroupTypeSelect = ({ value, onChange, error }: GroupTypeSelectProps) => {
  return (
    <div className="flex flex-col gap-y-6">
      <label
        className={clsx(
          "text-foreground text-sm font-semibold transition-colors duration-300",
          value ? "text-primary" : "text-foreground",
        )}
      >
        Tipo de grupo
      </label>

      <div className="flex flex-col gap-y-3">
        <div className="flex flex-wrap justify-center gap-2">
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = value === option.type;

            return (
              <Button
                key={option.type}
                type="button"
                aria-label="Group icon"
                onClick={() => onChange(isSelected ? undefined : option.type)}
                variant={isSelected ? "contained" : "outlined"}
                color={isSelected ? "primary" : "secondary"}
                className={clsx(
                  "!h-10 !w-10 !min-w-10 rounded-full border-2 !p-0",
                )}
              >
                <Tooltip content={option.label} color="info">
                  <Icon className="h-6 w-6" />
                </Tooltip>
              </Button>
            );
          })}
        </div>

        <Collapse isOpen={!!error}>
          <p className="text-danger mt-1 ml-1 text-start text-xs">{error}</p>
        </Collapse>
      </div>
    </div>
  );
};

export default GroupTypeSelect;
