import { type Dispatch, type SetStateAction, useRef } from "react";

import { useForm } from "@tanstack/react-form";
import type ReCAPTCHA from "react-google-recaptcha";

import useRegister from "@/hooks/auth/useRegister";

import type {
  RegisterFields,
  ResponseMessage,
  ServerErrorResponse,
} from "@/lib/api/types";
import { registerSchema } from "@/lib/validations/schemas";

import Button from "@/components/Button";
import FormErrorMessage from "@/components/FormErrorMessage";
import Input from "@/components/Input";
import ReCAPTCHAv2 from "@/components/ReCAPTCHAv2";

interface RegisterFormProps {
  setSuccessMessage: Dispatch<SetStateAction<ResponseMessage | null>>;
}

const RegisterForm = ({ setSuccessMessage }: RegisterFormProps) => {
  const { mutate: register, isPending } = useRegister();

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const form = useForm<
    RegisterFields,
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
      name: "",
      email: "",
      password: "",
      recaptchaToken: "",
    },
    onSubmit: async ({ value }) => {
      register(value, {
        onSuccess: (res) => {
          form.reset();
          recaptchaRef.current?.reset();

          res?.message && setSuccessMessage(res.message);
        },
        onError: (res) => {
          const {
            error: { message, fields = {} },
          }: ServerErrorResponse<RegisterFields> = res.response.data;

          form.setErrorMap({
            onSubmit: {
              fields,
            },
            onServer: message,
          });

          recaptchaRef.current?.reset();
        },
      });
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
        name="name"
        validators={{
          onBlur: (field) => {
            if (!field.value) return;

            return registerSchema.shape.name.safeParse(field.value).error
              ?.errors;
          },
        }}
        children={(field) => (
          <Input
            id="name"
            label="Nombre"
            placeholder="Nombre"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value.trim())}
            onBlur={field.handleBlur}
            autoComplete="name"
            required
            error={
              field.state.meta.errors[0]?.message ||
              field.state.meta.errorMap.onSubmit
            }
          />
        )}
      />

      <form.Field
        name="email"
        validators={{
          onBlur: (field) => {
            if (!field.value) return;

            return registerSchema.shape.email.safeParse(field.value).error
              ?.errors;
          },
        }}
        children={(field) => (
          <Input
            id="email"
            type="email"
            label="Correo electrónico"
            placeholder="Correo electrónico"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value.trim())}
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

            return registerSchema.shape.password.safeParse(field.value).error
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
            onChange={(e) => field.handleChange(e.target.value.trim())}
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
          onChange: registerSchema.shape.recaptchaToken,
        }}
        children={(field) => (
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
        )}
      />

      <Button type="submit" fullWidth className="mt-4" loading={isPending}>
        Registrarse
      </Button>

      <form.Subscribe
        selector={(state) => [state.errorMap]}
        children={([errorMap]) => (
          <FormErrorMessage message={errorMap.onServer} />
        )}
      />
    </form>
  );
};

export default RegisterForm;
