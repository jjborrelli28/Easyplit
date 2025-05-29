import { Cog } from "lucide-react";

const PageUnderConstructionMessage = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="border-h-background flex w-md flex-col items-center justify-center gap-y-8 border p-8 text-center shadow-xl">
        <h2 className="text-3xl font-semibold">Página en construcción</h2>

        <Cog className="animate-spin-slow h-30 w-30" />

        <p className="text-foreground/75">
          Estamos trabajando para traerte esta funcionalidad pronto.
        </p>
      </div>
    </div>
  );
};

export default PageUnderConstructionMessage;
