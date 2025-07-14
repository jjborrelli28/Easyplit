import type { Dispatch, SetStateAction } from "react";

import { useRouter } from "next/navigation";

import { useForm } from "@tanstack/react-form";

import useResetPassword from "@/hooks/data/auth/useResetPassword";

import type {
  ResetPasswordFields,
  ResponseMessage,
  ServerErrorResponse,
} from "@/lib/api/types";
import { resetPasswordSchema } from "@/lib/validations/schemas";

import Button from "@/components/Button";
import FormErrorMessage from "@/components/FormErrorMessage";
import Input from "@/components/Input";
import InputErrorMessage from "@/components/InputErrorMessage";

interface ResetPasswordFormProps {
  token: string;
  setSuccessMessage: Dispatch<SetStateAction<ResponseMessage | null>>;
}

const ResetPasswordForm = ({
  token,
  setSuccessMessage,
}: ResetPasswordFormProps) => {
  const router = useRouter();

  const { mutate: resetPassword, isPending } = useResetPassword();

  const form = useForm<
    ResetPasswordFields,
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
      password: "",
      token,
    },
    onSubmit: async ({ value }) => {
      resetPassword(value, {
        onSuccess: (res) => {
          form.reset();

          res?.message && setSuccessMessage(res.message);

          setTimeout(() => {
            router.push("/login");
          }, 5000);
        },
        onError: (res) => {
          const {
            error: { message, fields = {} },
          }: ServerErrorResponse<ResetPasswordFields> = res.response.data;

          form.setErrorMap({
            onSubmit: {
              fields,
            },
            onServer: message,
          });
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
        name="password"
        validators={{
          onBlur: (field) => {
            if (!field.value) return;

            return resetPasswordSchema.shape.password.safeParse(field.value)
              .error?.errors;
          },
        }}
      >
        {(field) => (
          <Input
            id="password"
            type="password"
            label="Nueva contraseña"
            placeholder="Nueva contraseña"
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
      </form.Field>

      <Button type="submit" fullWidth className="mt-7" loading={isPending}>
        Restablecer contraseña
      </Button>

      <form.Field
        name="token"
        validators={{
          onSubmit: (field) => {
            const result = resetPasswordSchema.shape.token.safeParse(
              field.value,
            );

            return result.success
              ? undefined
              : result.error.issues.map((e) => e.message);
          },
        }}
      >
        {(field) => (
          <InputErrorMessage message={field.state.meta.errorMap.onSubmit} />
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.errorMap]}>
        {([errorMap]) => (
          <FormErrorMessage message={errorMap.onServer || errorMap.onSubmit} />
        )}
      </form.Subscribe>
    </form>
  );
};

export default ResetPasswordForm;
