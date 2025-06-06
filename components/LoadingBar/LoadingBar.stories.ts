import type { Meta, StoryObj } from "@storybook/react";

import LoadingBar from ".";

const meta = {
  title: "Components/LoadingBar",
  component: LoadingBar,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof LoadingBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  args: {},
};
