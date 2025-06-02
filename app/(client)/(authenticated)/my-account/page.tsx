"use client";

import { type FormEvent, useEffect, useState } from "react";

import Image from "next/image";

import { useSession } from "next-auth/react";

import Button from "@/components/Button";
import Input from "@/components/Input";
import PageContainer from "@/components/PageContainer";

const initialFieldErrors = {
  name: null,
  email: null,
  password: null,
};

const MyAccountPage = () => {
  const { data } = useSession();

  const user = data?.user;

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState({
    name: null,
    email: null,
    password: null,
  });
  const [responseError, setResponseError] = useState<string[] | null>(null);

  useEffect(() => {
    if (user) {
      setName(user?.name ?? "");
      setEmail(user?.email ?? "");
    }
  }, [user]);

  const handleUpdateData = async (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <PageContainer className="border-h-background !px-0 md:border-r">
      <div className="border-h-background flex flex-col gap-y-8 border-t px-4 py-8 lg:px-8">
        <section className="flex flex-col gap-y-8">
          <h1 className="text-3xl font-bold">Mi cuenta</h1>

          <div className="grid-rows-auto grid w-full grid-cols-1 gap-8 lg:grid-cols-[auto_1fr]">
            <div className="border-foregrund relative mx-auto aspect-square h-50 w-50 rounded-full border-2">
              {user?.image && (
                <Image
                  alt="Avatar"
                  src={user.image}
                  fill
                  className="rounded-full"
                />
              )}
            </div>

            <form
              onSubmit={handleUpdateData}
              className="border-h-background grid-rows-auto grid w-full grid-cols-1 gap-4 border-t pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 xl:grid-cols-2 2xl:gap-8"
            >
              {name && (
                <Input
                  id="name"
                  type="text"
                  label="Nombre"
                  placeholder="Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="given-name"
                  required
                  editableToggle
                  disabled={true}
                  error={fieldErrors.name}
                />
              )}
              {email && (
                <Input
                  id="email"
                  type="email"
                  label="Correo electrónico"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  editableToggle
                  disabled={true}
                  error={fieldErrors.email}
                />
              )}
              <Input
                id="password"
                type="password"
                label="Contraseña"
                placeholder="Introduce una nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                editableToggle
                disabled={true}
                error={fieldErrors.password}
              />
            </form>

            <Button
              onSubmit={handleUpdateData}
              className="col-span-full justify-self-end"
            >
              Guardar
            </Button>
          </div>
        </section>

        <hr className="border-h-background w-full" />

        <section className="flex flex-col gap-y-8">
          <h2 className="text-3xl font-semibold">Eliminar tu cuenta</h2>

          <div className="grid-rows-auto grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto]">
            <p className="border-h-background lg:border-r lg:pr-8">
              Esta acción eliminará permanentemente tu cuenta y todos los datos
              asociados. No podrás recuperar tu información ni acceder
              nuevamente con este correo electrónico. Asegurate de que esta es
              la acción que querés realizar.
            </p>

            <Button onClick={() => undefined} color="danger" className="h-fit">
              Eliminar cuenta
            </Button>
          </div>
        </section>
      </div>
    </PageContainer>
  );
};

export default MyAccountPage;
