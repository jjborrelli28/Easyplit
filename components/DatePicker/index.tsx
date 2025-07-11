"use client";

import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { fiveYearsAgo, today } from "@/lib/utils";

import Input from "../Input";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover";
import clsx from "clsx";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  error?: string | null;
  containerClassName?: string;
}

export const DatePicker = ({
  value = today,
  onChange,
  error,
  containerClassName,
}: DatePickerProps) => {
  return (
    <Popover>
      <div className={clsx("relative", containerClassName)}>
        <Input
          label={value ? "Fecha de pago:" : "Elegí una fecha de pago →"}
          value={
            value
              ? `${format(value, "PPP", { locale: es })}${isSameDay(value, today) ? " (Hoy)" : ""}`
              : ""
          }
          error={error}
          className="pointer-events-none pr-12 text-start"
        />

        <PopoverTrigger
          asChild
          className="absolute top-10 right-3 cursor-pointer"
        >
          <CalendarIcon className="hover:text-primary h-6 w-6 transition-colors duration-300" />
        </PopoverTrigger>
      </div>

      <PopoverContent className="max-w-[326px]">
        <DayPicker
          locale={es}
          mode="single"
          selected={value}
          onSelect={(date) => {
            if (date && onChange) onChange(date);
          }}
          disabled={{ before: fiveYearsAgo, after: new Date() }}
          modifiersClassNames={{
            selected: "bg-primary !text-background rounded-full font-semibold",
            today: "text-primary font-semibold",
          }}
          classNames={{
            months: "flex flex-col-reverse",
            month_caption: "text-center py-2 font-semibold text-lg capitalize",
            nav: "flex",
            button_previous:
              "[&>svg]:!fill-primary absolute left-2 top-2 cursor-pointer",
            button_next:
              "[&>svg]:!fill-primary absolute right-2 top-2 cursor-pointer",
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
