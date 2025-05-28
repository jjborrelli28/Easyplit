import type { Meta, StoryObj } from "@storybook/react";

import ReCAPTCHAv2 from ".";

const meta = {
  title: "Components/ReCAPTCHAv2",
  component: ReCAPTCHAv2,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof ReCAPTCHAv2>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  args: {},
};

export const WithError: Story = {
  args: { error: "Fallo la verificación de reCAPTCHA" },
};
