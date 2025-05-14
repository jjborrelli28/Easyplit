import clsx from "clsx";

import type { Colors } from "./Button";

type SpinnerColors = Colors | "background" | "foreground";

const spinnerColors = {
  black: "border-black",
  white: "border-white",
  background: "border-background",
  foreground: "border-foreground",
  primary: "border-primary",
  secondary: "border-secondary",
  success: "border-success",
  warning: "border-warning",
  danger: "border-danger",
};

const Spinner = ({
  color = "primary",
  className,
}: {
  color?: SpinnerColors;
  className?: string;
}) => {
  return (
    <span
      className={clsx(
        "h-6 w-6 animate-spin rounded-full border-2 !border-t-transparent",
        spinnerColors[color],
        className,
      )}
    />
  );
};

export default Spinner;
