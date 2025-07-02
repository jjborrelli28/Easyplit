import type { Ref } from "react";

import ReCAPTCHA, { type ReCAPTCHAProps } from "react-google-recaptcha";

import { useTheme } from "next-themes";

import clsx from "clsx";

import Collapse from "../Collapse";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!;

interface ReCAPTCHATv2Props extends Omit<ReCAPTCHAProps, "sitekey"> {
  ref?: Ref<ReCAPTCHA>;
  error?: string | null | undefined;
  className?: string;
}

const ReCAPTCHAv2 = ({
  ref,
  error,
  className,
  ...restProps
}: ReCAPTCHATv2Props) => {
  const { resolvedTheme } = useTheme();

  return (
    <div className="mt-4">
      <ReCAPTCHA
        key={resolvedTheme}
        sitekey={SITE_KEY}
        ref={ref}
        theme={(resolvedTheme as ReCAPTCHAProps["theme"]) ?? "light"}
        className={clsx("recaptcha", className)}
        {...restProps}
      />

      <Collapse isOpen={!!error}>
        <p className="text-danger mt-1 ml-1 text-start text-xs">{error}</p>
      </Collapse>
    </div>
  );
};

export default ReCAPTCHAv2;
