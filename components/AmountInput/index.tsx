"use client";

import {
  type CSSProperties,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import clsx from "clsx";

import InputErrorMessage from "../InputErrorMessage";
import useWindowsDimensions from "@/hooks/useWindowsDimensions";

interface AmountInputProps {
  label?: string;
  value?: number;
  onChange: (formattedValue: number) => void;
  onFocus?: VoidFunction;
  onBlur?: VoidFunction;
  currencySymbol?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  error?: string | null;
  className?: string;
  containerClassName?: string;
}

const AmountInput = ({
  label,
  value = 0,
  onChange,
  onFocus,
  onBlur,
  currencySymbol = "$",
  id,
  name,
  disabled = false,
  error,
  className,
  containerClassName,
}: AmountInputProps) => {
  const { width } = useWindowsDimensions();

  const hasMounted = useRef(false);
  const lastWidthRef = useRef<number | null>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [inputWidth, setInputWidth] = useState(0);
  const [numberWidth, setNumberWidth] = useState(0);
  const [fontScale, setFontScale] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const formattedValue = value.toFixed(2);
  const [integerPart, decimalPart] = formattedValue.split(".");

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    if (numberWidth >= inputWidth && fontScale >= 0.5) {
      setFontScale((prev) => prev * 0.9);
    } else if (
      numberWidth < inputWidth &&
      inputWidth - numberWidth > 50 &&
      fontScale <= 1
    ) {
      setFontScale((prev) => prev * 1.1);
    }
  }, [inputWidth, numberWidth, fontScale]);

  useLayoutEffect(() => {
    const last = lastWidthRef.current;

    if (
      (last !== null && last < 1024 && width >= 1024) ||
      (last !== null && last >= 1024 && width < 1024)
    ) {
      setRefreshKey((prev) => prev + 1);
    }

    lastWidthRef.current = width;
  }, [width]);

  const forceCursorToEnd = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const length = input.value.length;
    input.setSelectionRange(length, length);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    forceCursorToEnd(e);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");

    if (raw.length > 15) return;

    const padded = raw.padStart(3, "0");
    const intPart = padded.slice(0, -2);
    const decimalPart = padded.slice(-2);
    const formattedString = `${intPart}.${decimalPart}`;
    const formattedNumber = +formattedString;

    if (formattedNumber <= 1_000_000_000_000_000) {
      onChange(formattedNumber);
    }
  };

  return (
    <fieldset
      className={clsx("relative flex w-full flex-col pt-7", containerClassName)}
    >
      {label && (
        <label
          className={clsx(
            "absolute left-0 translate-x-1 -translate-y-6 transform text-sm font-semibold transition-all duration-300",
            (value !== 0 || isFocused) && "text-primary",
          )}
        >
          {label}
        </label>
      )}

      <div
        className={clsx(
          "relative flex h-22 w-full justify-center",
          disabled && "opacity-60",
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
          value={parseInt(`${integerPart}${decimalPart}`).toString()}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onClick={forceCursorToEnd}
          onKeyUp={forceCursorToEnd}
          className="absolute top-0 left-0 h-full w-full opacity-0"
        />

        <div
          key={refreshKey}
          ref={(el) => {
            el && setNumberWidth(el.clientWidth);
          }}
          className={clsx(
            "text-foreground pointer-events-none relative flex w-fit items-center transition-colors duration-300",
            value === 0 && "text-foreground/50",
            className,
          )}
          style={{ maxWidth: inputWidth }}
        >
          <span
            className={clsx(
              "overflow-hidden px-2 font-semibold transition-colors duration-300",
              value === 0 && "text-foreground/50",
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

      <InputErrorMessage message={error} />
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
