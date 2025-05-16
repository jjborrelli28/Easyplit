import Header from "./(pages)/(unauthenticated)/_components/Header";

import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";

const NotFoundPage = () => {
  return (
    <>
      <Header />

      <PageContainer>
        <div className="border-h-background space-y-8 border p-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold">
              404 - Página no encontrada
            </h1>

            <p className="text-foreground/60">
              La página que estás buscando no existe.
            </p>
          </div>

          <Button href="/">Volver al inicio</Button>
        </div>
      </PageContainer>
    </>
  );
};

export default NotFoundPage;
