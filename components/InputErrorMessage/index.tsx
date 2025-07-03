import Collapse from "../Collapse";

interface InputErrorMessageProps {
  message?: string | string[] | null;
}

const InputErrorMessage = ({ message }: InputErrorMessageProps) => {
  const isArray = Array.isArray(message);

  return (
    <Collapse isOpen={!!message}>
      {isArray ? (
        message.map((paragraph, i) => (
          <p
            key={i}
            className="text-danger mt-1 ml-1 text-start text-xs italic"
          >
            {paragraph}
          </p>
        ))
      ) : (
        <p className="text-danger mt-1 ml-1 text-start text-xs italic">
          {message}
        </p>
      )}
    </Collapse>
  );
};

export default InputErrorMessage;
