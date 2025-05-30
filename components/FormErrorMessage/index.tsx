import clsx from "clsx";
import { CircleAlert } from "lucide-react";

import Collapse from "../Collapse";

interface FormErrorMessageProps {
  message?: string[] | null;
  containerClassName?: string;
  paragraphClassName?: string;
}

const FormErrorMessage = ({
  message,
  containerClassName,
  paragraphClassName,
}: FormErrorMessageProps) => {
  return (
    <Collapse isOpen={!!message}>
      <div
        className={clsx(
          "border-danger text-danger mt-2 mb-3 flex items-center border",
          containerClassName,
        )}
      >
        <div className="flex h-full items-center px-3 py-2">
          <CircleAlert className="text-danger h-5 w-5" />
        </div>

        <div className="border-danger space-y-1 border-l px-3 py-2 text-start">
          {message &&
            message.map((paragraph, i) => (
              <p key={i} className={clsx("text-xs", paragraphClassName)}>
                {paragraph}
              </p>
            ))}
        </div>
      </div>
    </Collapse>
  );
};

export default FormErrorMessage;
