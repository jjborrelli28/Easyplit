import Button from "@/components/Button";

const DeleteAccountSection = () => {
  return (
    <section className="flex flex-col gap-y-8">
      <h2 className="text-3xl font-semibold">Eliminar tu cuenta</h2>

      <div className="grid-rows-auto grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto]">
        <p className="border-h-background lg:border-r lg:pr-8">
          Esta acción eliminará permanentemente tu cuenta y todos los datos
          asociados. No podrás recuperar tu información ni acceder nuevamente
          con este correo electrónico. Asegurate de que esta es la acción que
          querés realizar.
        </p>

        <Button
          onClick={() => undefined}
          color="danger"
          className="h-fit min-w-40 justify-self-end"
        >
          Eliminar cuenta
        </Button>
      </div>
    </section>
  );
};

export default DeleteAccountSection;
