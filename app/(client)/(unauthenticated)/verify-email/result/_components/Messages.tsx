import Button from "@/components/Button";

export const SuccessMessage = () => {
  return (
    <div className="space-y-8 p-8">
      <div className="space-y-4">
        <h1 className="text-success text-3xl font-semibold">
          ¡Email verificado con éxito!
        </h1>

        <p>Ya podés iniciar sesión.</p>
      </div>

      <Button href="/login" color="success" fullWidth>
        Iniciar sesión
      </Button>
    </div>
  );
};

export const AlreadyVerified = () => {
  return (
    <div className="space-y-8 p-8">
      <div className="space-y-4">
        <h1 className="text-warning text-3xl font-semibold">
          Email ya verificado
        </h1>

        <p>Tu email ya estaba verificado, podés iniciar sesión.</p>
      </div>

      <Button href="/login" color="warning" fullWidth>
        Iniciar sesión
      </Button>
    </div>
  );
};

export const ErrorMessage = () => {
  return (
    <div className="space-y-8 p-8">
      <div className="space-y-4">
        <h1 className="text-danger text-3xl font-semibold">
          Error al verificar tu email
        </h1>

        <p>El enlace no es válido o ya fue usado.</p>
      </div>

      <Button href="/register" color="danger" fullWidth>
        Volve a intentarlo
      </Button>
    </div>
  );
};
