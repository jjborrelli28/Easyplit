import type { Meta, StoryObj } from "@storybook/react";

import Spinner from ".";

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: { type: "select" },
      options: [
        "black",
        "white",
        "background",
        "foreground",
        "primary",
        "secondary",
        "success",
        "warning",
        "danger",
      ],
    },
  },
  args: {},
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  args: { color: "primary" },
};
