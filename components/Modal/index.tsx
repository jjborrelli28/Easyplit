import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import clsx from "clsx";
import { X } from "lucide-react";

import Button from "../Button";
import useWindowsDimensions from "@/hooks/useWindowsDimensions";

export interface ModalProps {
  isOpen: boolean;
  onClose: VoidFunction;
  showHeader?: boolean;
  title?: string;
  children: ReactNode;
  unstyled?: boolean;
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
  unstyled,
  className,
  headerClassName,
  contentClassName,
}: ModalProps) => {
  const { height: windowHeight } = useWindowsDimensions();

  const modalRef = useRef<HTMLDivElement>(null);

  const [modalHeight, setModalHeight] = useState(0);

  useEffect(() => {
    if (modalRef.current) {
      setModalHeight(modalRef.current.clientHeight);
    }
  }, [isOpen]);

  const handleClose = () => {
    document.body.classList.remove("overflow-hidden");

    onClose();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    if (isOpen) {
      document.body.classList.add("overflow-hidden");
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={clsx(
        "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4",
        modalHeight >= windowHeight - 32 ? "items-start" : "items-center",
      )}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className={clsx(
          !unstyled &&
            "bg-background border-foreground/50 flex w-md max-w-md flex-col gap-y-4 border p-4 shadow-xl lg:gap-y-8 lg:p-8",
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
              aria-label="Close modal"
              onClick={handleClose}
              unstyled
              className="hover:text-foreground/90 cursor-pointer pl-4 transition-colors duration-300 lg:pl-8"
            >
              <X />
            </Button>
          </div>
        )}

        <div
          className={clsx(
            !unstyled && "flex flex-col gap-y-8 overflow-y-auto",
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
