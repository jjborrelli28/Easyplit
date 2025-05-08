"use client";

import { useSearchParams } from "next/navigation";

const VerifyResultPage = () => {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  return (
    <div className="max-w-xl mx-auto mt-10 text-center">
      {status === "success" ? (
        <>
          <h1 className="text-2xl font-bold text-green-600">
            ¡Email verificado con éxito!
          </h1>
          <p>Ya podés iniciar sesión.</p>
        </>
      ) : status === "already_verified" ? (
        <>
          <h1 className="text-2xl font-bold text-blue-600">
            Email ya verificado
          </h1>
          <p>Tu email ya estaba verificado. Podés iniciar sesión.</p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-red-600">
            Error al verificar tu email
          </h1>
          <p>El enlace no es válido o ya fue usado.</p>
        </>
      )}
    </div>
  );
};

export default VerifyResultPage;
