import { type Dispatch, type SetStateAction, useRef } from "react";

import { useForm } from "@tanstack/react-form";
import type ReCAPTCHA from "react-google-recaptcha";

import useForgotPassword from "@/hooks/auth/useForgotPassword";

import type {
  ForgotPasswordFields,
  ResponseMessage,
  ServerErrorResponse,
} from "@/lib/api/types";
import { forgotPasswordSchema } from "@/lib/validations/schemas";

import Button from "@/components/Button";
import FormErrorMessage from "@/components/FormErrorMessage";
import Input from "@/components/Input";
import ReCAPTCHAv2 from "@/components/ReCAPTCHAv2";

interface ForgotPasswordFormProps {
  setSuccessMessage: Dispatch<SetStateAction<ResponseMessage | null>>;
}

const ForgotPasswordForm = ({ setSuccessMessage }: ForgotPasswordFormProps) => {
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const form = useForm<
    ForgotPasswordFields,
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
      recaptchaToken: "",
    },
    onSubmit: async ({ value }) => {
      forgotPassword(value, {
        onSuccess: (res) => {
          form.reset();
          recaptchaRef.current?.reset();

          res?.message && setSuccessMessage(res.message);
        },
        onError: (res) => {
          const {
            error: { message, fields = {} },
          }: ServerErrorResponse<ForgotPasswordFields> = res.response.data;

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
        name="email"
        validators={{
          onBlur: (field) => {
            if (!field.value) return;

            return forgotPasswordSchema.shape.email.safeParse(field.value).error
              ?.errors;
          },
        }}
        children={(field) => (
          <Input
            id="email"
            type="email"
            label="Correo electrónico"
            placeholder="ejemplo@email.com"
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
        name="recaptchaToken"
        validators={{
          onChange: forgotPasswordSchema.shape.recaptchaToken,
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
                    recaptchaToken:
                      "El reCAPTCHA expiró, por favor completalo nuevamente.",
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
        Enviar correo de recuperación
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

export default ForgotPasswordForm;
