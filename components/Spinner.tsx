import clsx from "clsx";

const Spinner = ({ className }: { className?: string }) => {
  return (
    <span
      className={clsx(
        "h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent",
        className,
      )}
    />
  );
};

export default Spinner;
