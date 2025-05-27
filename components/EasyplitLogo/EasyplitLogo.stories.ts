import type { Meta, StoryObj } from "@storybook/react";

import EasyplitLogo from ".";

const meta = {
  title: "Components/EasyplitLogo",
  component: EasyplitLogo,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof EasyplitLogo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const IsAnimated: Story = {
  args: { isAnimated: true },
};
