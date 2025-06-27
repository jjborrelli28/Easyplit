import type { Meta, StoryObj } from "@storybook/react";

import Badge from ".";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "danger"],
    },
  },
  args: {},
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Primary: Story = {
  args: {
    children: "Primary",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    color: "secondary",
  },
};

export const Info: Story = {
  args: {
    children: "Info",
    color: "info",
  },
};

export const Success: Story = {
  args: {
    children: "Success",
    color: "success",
  },
};

export const Warning: Story = {
  args: {
    children: "Warning",
    color: "warning",
  },
};

export const Danger: Story = {
  args: {
    children: "Danger",
    color: "danger",
  },
};
