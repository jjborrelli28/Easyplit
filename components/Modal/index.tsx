import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

import clsx from "clsx";
import { X } from "lucide-react";

import Button from "../Button";

export interface ModalProps {
  isOpen: boolean;
  onClose: VoidFunction;
  showHeader?: boolean;
  title?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

const Modal = ({
  isOpen,
  onClose,
  showHeader = true,
  title,
  children,
  className,
  headerClassName,
  contentClassName,
}: ModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
      <div
        role="dialog"
        aria-modal="true"
        className={clsx(
          "bg-background border-h-background flex w-full max-w-md flex-col gap-y-8 border p-4 shadow-xl lg:p-8",
          className,
        )}
      >
        {showHeader && (
          <div
            className={clsx(
              "flex items-start justify-between",
              headerClassName,
            )}
          >
            {title && <h2 className="text-2xl font-semibold">{title}</h2>}

            <Button
              aria-label="Cerrar"
              onClick={onClose}
              unstyled
              className="hover:text-foreground/90 cursor-pointer transition-colors duration-300"
            >
              <X />
            </Button>
          </div>
        )}

        <div className={clsx("flex flex-col gap-y-8", contentClassName)}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
