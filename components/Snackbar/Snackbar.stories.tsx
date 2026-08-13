import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Snackbar from ".";

const meta = {
  title: "Components/Snackbar",
  component: Snackbar,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: { type: "select" },
      options: ["primary", "secondary", "info", "success", "warning", "danger"],
    },
  },
  args: {
    children: "Solicitud de contacto enviada",
    duration: 4000,
    onClose: fn(),
  },
} satisfies Meta<typeof Snackbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    color: "primary",
  },
};

export const Secondary: Story = {
  args: {
    color: "secondary",
  },
};

export const Info: Story = {
  args: {
    color: "info",
  },
};

export const Success: Story = {
  args: {
    color: "success",
  },
};

export const Warning: Story = {
  args: {
    color: "warning",
  },
};

export const Danger: Story = {
  args: {
    color: "danger",
  },
};
