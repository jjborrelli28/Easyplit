"use client";

import { redirect, useSearchParams } from "next/navigation";

import clsx from "clsx";
import { CheckCircle, CircleAlert, CircleX } from "lucide-react";

type States = "success" | "already_verified" | "error";

const borderColors: Record<States, string> = {
  success: "border-success",
  ["already_verified"]: "border-warning",
  error: "border-danger",
};

const VerifyResultPage = () => {
  const searchParams = useSearchParams();

  const status = searchParams.get("status");

  if (!status || !["success", "already_verified", "error"].includes(status)) {
    redirect("/login");
  }

  return (
    <main className="container mx-auto flex min-h-screen flex-1 flex-col items-center justify-center">
      <div
        className={clsx(
          "flex max-w-2xl rounded-xl border-2 text-center shadow-xl",
          borderColors[status as States],
        )}
      >
        <div
          className={clsx(
            "flex items-center border-r-2 p-8",
            borderColors[status as States],
          )}
        >
          {status === "success" ? (
            <CheckCircle className="text-success h-14 w-14" />
          ) : status === "already_verified" ? (
            <CircleAlert className="text-warning h-14 w-14" />
          ) : (
            <CircleX className="text-danger h-14 w-14" />
          )}
        </div>

        {status === "success" ? (
          <div className="space-y-4 p-8">
            <h1 className="text-success text-3xl font-bold">
              ¡Email verificado con éxito!
            </h1>

            <p>Ya podés iniciar sesión.</p>
          </div>
        ) : status === "already_verified" ? (
          <div className="space-y-4 p-8">
            <h1 className="text-warning text-3xl font-bold">
              Email ya verificado
            </h1>

            <p>Tu email ya estaba verificado, podés iniciar sesión.</p>
          </div>
        ) : (
          <div className="space-y-4 p-8">
            <h1 className="text-danger text-3xl font-semibold">
              Error al verificar tu email
            </h1>

            <p>El enlace no es válido o ya fue usado.</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default VerifyResultPage;
