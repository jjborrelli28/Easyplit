import type { Meta, StoryObj } from "@storybook/react";

import ThemeProvider from "@/providers/ThemeProvider";

import ThemeToggle from ".";

const meta = {
  title: "Components/ThemeToggle",
  component: ThemeToggle,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof ThemeToggle>;

export default meta;

type Story = StoryObj<typeof ThemeToggle>;

export const Example: Story = {
  args: {},

  render: () => {
    return (
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
  },
};
