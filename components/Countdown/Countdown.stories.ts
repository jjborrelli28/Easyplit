import type { Meta, StoryObj } from "@storybook/react";

import Countdown from ".";

const meta = {
  title: "Components/Countdown",
  component: Countdown,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof Countdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  args: { start: 10, onComplete: () => alert("Example function executed") },
};
