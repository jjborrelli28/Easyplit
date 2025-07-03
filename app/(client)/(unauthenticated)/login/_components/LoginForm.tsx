import { redirect } from "next/navigation";
import { useRef, useState } from "react";

import { signIn } from "next-auth/react";

import { useForm } from "@tanstack/react-form";
import ReCAPTCHA from "react-google-recaptcha";

import { ServerErrorResponse } from "@/lib/api/types";
import { loginSchema } from "@/lib/validations/schemas";

import Button from "@/components/Button";
import FormErrorMessage from "@/components/FormErrorMessage";
import Input from "@/components/Input";
import ReCAPTCHAv2 from "@/components/ReCAPTCHAv2";

const LoginForm = () => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<
    { email: string; password: string; recaptchaToken: string },
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    () => string[],
    undefined
  >({
    defaultValues: {
      email: "",
      password: "",
      recaptchaToken: "",
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);

      const res = await signIn("credentials", {
        ...value,
        redirect: false,
      });

      setIsLoading(false);

      if (res?.ok) return redirect("/dashboard");

      if (res?.error) {
        const {
          message = [],
          fields = {},
        }: ServerErrorResponse<{
          email?: string;
          password?: string;
          recaptchaToken?: string;
        }>["error"] = JSON.parse(res.error);

        form.setErrorMap({
          onSubmit: {
            fields,
          },
          onServer: message,
        });

        recaptchaRef.current?.reset();
      }
    },
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        form.handleSubmit();
      }}
      className="flex flex-col gap-y-1"
    >
      <form.Field
        name="email"
        validators={{
          onBlur: (field) => {
            if (!field.value) return;

            return loginSchema.shape.email.safeParse(field.value).error?.errors;
          },
        }}
        children={(field) => (
          <Input
            id="email"
            type="email"
            label="Correo electrónico"
            placeholder="Correo electrónico"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            autoComplete="email"
            required
            error={
              field.state.meta.errors[0]?.message ||
              field.state.meta.errorMap.onSubmit
            }
          />
        )}
      />

      <form.Field
        name="password"
        validators={{
          onBlur: (field) => {
            if (!field.value) return;

            return loginSchema.shape.password.safeParse(field.value).error
              ?.errors;
          },
        }}
        children={(field) => (
          <Input
            id="password"
            type="password"
            label="Contraseña"
            placeholder="Contraseña"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            autoComplete="password"
            required
            error={
              field.state.meta.errors[0]?.message ||
              field.state.meta.errorMap.onSubmit
            }
          />
        )}
      />

      <form.Field
        name="recaptchaToken"
        validators={{
          onChange: loginSchema.shape.recaptchaToken,
        }}
        children={(field) => {
          return (
            <ReCAPTCHAv2
              ref={recaptchaRef}
              onChange={(token) => {
                field.handleChange(token ?? "");
              }}
              onExpired={() => {
                recaptchaRef.current?.reset();

                form.setErrorMap({
                  onSubmit: {
                    fields: {
                      recaptchaToken: [
                        "El reCAPTCHA expiró, por favor completalo nuevamente.",
                      ],
                    },
                  },
                });
              }}
              error={
                field.state.meta.errors[0]?.message ||
                field.state.meta.errorMap.onSubmit
              }
            />
          );
        }}
      />

      <Button type="submit" fullWidth className="mt-4" loading={isLoading}>
        Iniciar sesión
      </Button>

      <form.Subscribe
        selector={(state) => [state.errorMap]}
        children={([errorMap]) => {
          return <FormErrorMessage message={errorMap.onServer} />;
        }}
      />
    </form>
  );
};

export default LoginForm;
