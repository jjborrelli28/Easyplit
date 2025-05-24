import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";

const NotFoundPage = () => {
  return (
    <PageContainer centered>
      <div className="border-h-background flex w-full max-w-md flex-col items-center space-y-8 border p-8 text-center">
        <div className="space-y-4">
          <p className="text-6xl font-semibold">404</p>

          <h1 className="text-3xl font-semibold">Página no encontrada</h1>

          <p className="text-foreground/75">
            La página que estás buscando no existe.
          </p>
        </div>

        <Button href="/" fullWidth>
          Volver al inicio
        </Button>
      </div>
    </PageContainer>
  );
};

export default NotFoundPage;
