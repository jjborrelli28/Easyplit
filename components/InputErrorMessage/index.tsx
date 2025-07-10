import clsx from "clsx";
import Collapse from "../Collapse";

interface InputErrorMessageProps {
  message?: string | string[] | null;
  className?: string;
}

const InputErrorMessage = ({ message, className }: InputErrorMessageProps) => {
  const isArray = Array.isArray(message);

  return (
    <Collapse isOpen={!!message}>
      {isArray ? (
        message.map((paragraph, i) => (
          <p
            key={i}
            className={clsx(
              "text-danger mt-1 ml-1 text-start text-xs italic",
              className,
            )}
          >
            {paragraph}
          </p>
        ))
      ) : (
        <p
          className={clsx(
            "text-danger mt-1 ml-1 text-start text-xs italic",
            className,
          )}
        >
          {message}
        </p>
      )}
    </Collapse>
  );
};

export default InputErrorMessage;
