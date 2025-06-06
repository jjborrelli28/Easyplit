import clsx from "clsx";

interface LoadingBarProps {
  className?: string;
  containerClassName?: string;
}

const LoadingBar = ({ className, containerClassName }: LoadingBarProps) => {
  return (
    <div
      className={clsx(
        "bg-h-background relative h-1 w-full overflow-hidden",
        containerClassName,
      )}
    >
      <div
        className={clsx(
          "animate-slide-bar bg-primary absolute top-0 left-[-30%] h-full w-[30%]",
          className,
        )}
      />
    </div>
  );
};

export default LoadingBar;
