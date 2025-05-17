import type { Meta, StoryObj } from "@storybook/react";

import AuthDivider from ".";

const meta = {
  title: "Components/AuthDivider",
  component: AuthDivider,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof AuthDivider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  args: {},

};
