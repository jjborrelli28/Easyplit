import ReCAPTCHA, { type ReCAPTCHAProps } from "react-google-recaptcha";

import Collapse from "../Collapse";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!;

interface ReCAPTCHATv2Props extends Omit<ReCAPTCHAProps, "sitekey"> {
  error?: string | null | undefined;
}

const ReCAPTCHAv2 = ({ error, ...restProps }: ReCAPTCHATv2Props) => {
  return (
    <div className="mt-4">
      <ReCAPTCHA sitekey={SITE_KEY} {...restProps} className="w-full" />

      <Collapse isOpen={!!error}>
        <p className="text-danger mt-1 ml-1 text-start text-xs">{error}</p>
      </Collapse>
    </div>
  );
};

export default ReCAPTCHAv2;
