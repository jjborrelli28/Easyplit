"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import clsx from "clsx";

export const initialAmoutValue = "0.00";

const formatRawToAmount = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").padStart(3, "0");
  const intPart = digits.slice(0, -2);
  const decimalPart = digits.slice(-2);

  if (decimalPart === "00" && intPart.replace(/^0+/, "") !== "") {
    return intPart.replace(/^0+/, "") || "0";
  }

  return `${intPart}.${decimalPart}`;
};

const splitAmount = (formatted: string) => {
  const [int, dec] = formatted.split(".");
  return {
    integerPart: int || "0",
    decimalPart: dec?.padEnd(2, "0").slice(0, 2) || "00",
  };
};

const parseOnlyNumbers = (value: string): string => {
  if (value === initialAmoutValue) return "";

  const onlyNumbers = value.replace(/\D/g, "");
  const noLeadingZeros = onlyNumbers.replace(/^0+/, "");

  return noLeadingZeros === "" ? "0" : noLeadingZeros;
};

interface AmountInputProps {
  label?: string;
  value: string; // e.g. "12.34"
  onChange: (formattedValue: string) => void;
  currencySymbol?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  containerClassName?: string;
  className?: string;
}

const AmountInput = ({
  label,
  value,
  onChange,
  currencySymbol = "$",
  id,
  name,
  disabled = false,
  containerClassName,
  className,
}: AmountInputProps) => {
  const hasMounted = useRef(false);

  const [isFocused, setIsFocused] = useState(false);

  const [inputWidth, setInputWidth] = useState(0);
  const [numberWidth, setNumberWidth] = useState(0);
  const [fontScale, setFontScale] = useState(1);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;

      return;
    }

    if (numberWidth >= inputWidth && fontScale >= 0.5) {
      setFontScale((prevState) => prevState * 0.9);
    } else if (
      numberWidth < inputWidth &&
      inputWidth - numberWidth > 50 &&
      fontScale <= 1
    ) {
      setFontScale((prevState) => prevState * 1.1);
    }
  }, [inputWidth, numberWidth, fontScale]);

  const forceCursorToEnd = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const length = input.value.length;

    input.setSelectionRange(length, length);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);

    forceCursorToEnd(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, "");
    const formatted = formatRawToAmount(digitsOnly);

    onChange(formatted);
  };

  const { integerPart, decimalPart } = splitAmount(value);

  return (
    <fieldset className="flex w-full flex-col">
      {label && (
        <label
          className={clsx(
            "text-foreground text-sm font-semibold transition-colors duration-300",
            value !== initialAmoutValue || isFocused
              ? "text-primary"
              : "text-foreground",
          )}
        >
          {label}
        </label>
      )}

      <div
        className={clsx(
          "relative flex h-22 w-full justify-center",
          disabled && "opacity-60",
          containerClassName,
        )}
      >
        <input
          ref={(el) => {
            el && setInputWidth(el.clientWidth);
          }}
          id={id}
          name={name}
          inputMode="numeric"
          pattern="[0-9]*"
          disabled={disabled}
          value={parseOnlyNumbers(value)}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={() => setIsFocused(false)}
          onClick={forceCursorToEnd}
          onKeyUp={forceCursorToEnd}
          className="absolute top-0 left-0 h-full w-full opacity-100"
        />

        <div
          ref={(el) => {
            el && setNumberWidth(el.clientWidth);
          }}
          className={clsx(
            "text-foreground pointer-events-none relative flex w-fit items-center transition-colors duration-300",
            value === initialAmoutValue && "text-foreground/50",
            className,
          )}
          style={{ maxWidth: inputWidth }}
        >
          <span
            className={clsx(
              "px-2 font-semibold transition-colors duration-300",
              value === initialAmoutValue && "text-foreground/50",
            )}
            style={{ fontSize: `calc(2.5rem * ${fontScale})` }}
          >
            {currencySymbol}
          </span>

          <span
            className="truncate font-semibold"
            style={{ fontSize: `calc(4rem * ${fontScale})` }}
          >
            {integerPart}
          </span>

          <span
            className="relative font-semibold"
            style={{
              fontSize: `calc(1.5rem * ${fontScale})`,
              top: `calc(-0.8rem * ${fontScale})`,
            }}
          >
            .{decimalPart}
            {isFocused && (
              <Cursor
                style={{
                  height: `calc(0.9rem * ${fontScale})`,
                  top: `calc(0.66rem * ${fontScale})`,
                }}
              />
            )}
          </span>
        </div>
      </div>
    </fieldset>
  );
};

export default AmountInput;

const Cursor = ({ style }: { style: CSSProperties }) => (
  <span
    className="animate-cursor absolute inline-block w-[1px]"
    style={style}
  />
);
