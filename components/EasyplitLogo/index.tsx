import clsx from "clsx";

interface EasyplitLogoProps {
  isAnimated?: boolean;
}
const EasyplitLogo = ({ isAnimated = false }: EasyplitLogoProps) => {
  return (
    <div className="group flex items-center gap-x-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={clsx(
          "lucide lucide-circle-dollar-sign-icon lucide-circle-dollar-sign bg-h-background rotate-45 rounded-full shadow-xl",
          isAnimated &&
            "transition-transform duration-300 group-hover:rotate-0",
        )}
      >
        <circle cx="12" cy="12" r="11" className="text-foreground" />
        <path
          d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"
          className="text-foreground"
        />
        <path
          d="M12 18V6"
          className={clsx("text-primary", isAnimated && "animate-pulse")}
        />
      </svg>
      <p className="text-foreground text-xl font-bold">
        easy
        <span className={clsx("text-primary", isAnimated && "animate-pulse")}>
          plit
        </span>
      </p>
    </div>
  );
};

export default EasyplitLogo;
