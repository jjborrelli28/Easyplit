import { useState } from "react";

import clsx from "clsx";
import { Repeat } from "lucide-react";

import Button from "../Button";
import InputErrorMessage from "../InputErrorMessage";
import Modal from "../Modal";
import Tooltip from "../Tooltip";
import { EXPENSE_CATEGORIES, EXPENSE_TYPE, EXPENSE_TYPES } from "./constants";

interface ExpenseTypeSelectProps {
  label?: string;
  value?: EXPENSE_TYPE;
  onChange: (value: EXPENSE_TYPE) => void;
  error?: string | null;
  containerClassName?: string;
}

const ExpenseTypeSelect = ({
  label,
  value = EXPENSE_TYPE.UNCATEGORIZED,
  onChange,
  error,
  containerClassName,
}: ExpenseTypeSelectProps) => {
  const [isOpen, setIsisOpen] = useState(false);

  const type = value ?? EXPENSE_TYPE.UNCATEGORIZED;
  const Icon = EXPENSE_TYPES[type].icon;

  return (
    <>
      <div className={clsx("relative flex flex-col pt-7", containerClassName)}>
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
                "flex h-6 w-6 items-center justify-center rounded-full",
                EXPENSE_TYPES[type].color,
              )}
            >
              <Icon className="text-background h-3.5 w-3.5" />
            </div>

            <p>{EXPENSE_TYPES[type].label}</p>
          </div>

          <Button
            type="button"
            aria-label="Show expense categories"
            onClick={() => setIsisOpen(true)}
            unstyled
            className={clsx(
              "hover:text-primary flex cursor-pointer gap-x-3 transition-colors duration-300",
            )}
          >
            <Repeat className="h-6 w-6" />
          </Button>
        </div>

        <InputErrorMessage message={error} />
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsisOpen(false)}
        title="Selecciona una categoría"
        className="w-xl max-w-xl"
      >
        <div className="flex flex-col gap-4">
          {Object.entries(EXPENSE_CATEGORIES).map(([group, types]) => (
            <div key={group} className="flex flex-col gap-y-2">
              <h3 className="font-semibold">{group}</h3>

              <div className="flex flex-wrap gap-2">
                {types.map((type) => {
                  const label = EXPENSE_TYPES[type].label;
                  const Icon = EXPENSE_TYPES[type].icon;

                  return (
                    <Tooltip key={type} color="info" content={label}>
                      <Button
                        type="button"
                        aria-label="Select expense type"
                        onClick={() => {
                          onChange(type);
                          setIsisOpen(false);
                        }}
                        unstyled
                        className={clsx(
                          "text-background flex h-10 w-10 cursor-pointer items-center justify-center rounded-full shadow-xl",
                          value === type
                            ? "animate-bg-color-pulse"
                            : EXPENSE_TYPES[type].color,
                        )}
                      >
                        <Icon className="h-5.5 w-5.5" />
                      </Button>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default ExpenseTypeSelect;
