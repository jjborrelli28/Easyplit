// app/buttons-demo/page.tsx
"use client";

import Button from "@/components/Button";

const colors = [
  "primary",
  "secondary",
  "tertiary",
  "success",
  "warning",
  "danger",
] as const;
const variants = ["contained", "outlined"] as const;

const ButtonsDemo = () => {
  return (
    <div className="text-foreground container mx-auto min-h-screen p-24">
      <h1 className="mb-8 text-3xl font-bold">Buttons Demo</h1>
      <div className="grid grid-cols-1 gap-12 p-8 md:grid-cols-2 lg:grid-cols-4">
        {colors.map((color) =>
          variants.map((variant) => (
            <div
              key={`${color}-${variant}`}
              className="border-background/25 flex flex-col gap-2 border p-8"
            >
              <p className="pb-6 font-semibold capitalize">
                {variant} {color}
              </p>
              <Button color={color} variant={variant} className="capitalize">
                {variant} {color}
              </Button>
              <Button color={color} variant={variant} disabled>
                Disabled
              </Button>
              <Button color={color} variant={variant} loading>
                Loading
              </Button>
            </div>
          )),
        )}
      </div>
    </div>
  );
};
export default ButtonsDemo;
