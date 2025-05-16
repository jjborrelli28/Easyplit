import type { Meta, StoryObj } from "@storybook/react";

import ThemeToggle from ".";
import ThemeProvider from "../ThemeProvider";

const meta = {
  title: "Theme/ThemeToggle",
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

  render: (args) => {
    return (
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
  },
};
