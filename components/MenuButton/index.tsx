import clsx from "clsx";

interface MenuButtonProps {
  isOpen: boolean;
  onClick?: () => void;
  className?: string;
}

const MenuButton = ({ isOpen, onClick, className }: MenuButtonProps) => {
  return (
    <button
      aria-label="Toggle menu"
      onClick={onClick}
      className={clsx(
        "group flex h-10 w-10 cursor-pointer items-center justify-center",
        className,
      )}
    >
      <div className="relative h-6 w-6">
        <span
          className={clsx(
            "bg-primary group-hover:bg-primary/90 absolute left-0 h-0.5 w-full rounded transition-all duration-300",
            isOpen ? "top-2.75 rotate-45" : "top-0.5",
          )}
        />
        <span
          className={clsx(
            "bg-primary group-hover:bg-primary/90 absolute left-0 h-0.5 w-full rounded transition-all duration-300",
            isOpen ? "opacity-0" : "top-2.75 opacity-100",
          )}
        />
        <span
          className={clsx(
            "bg-primary group-hover:bg-primary/90 absolute left-0 h-0.5 w-full rounded transition-all duration-300",
            isOpen ? "top-2.75 -rotate-45" : "bottom-0.5",
          )}
        />
      </div>
    </button>
  );
};

export default MenuButton;
