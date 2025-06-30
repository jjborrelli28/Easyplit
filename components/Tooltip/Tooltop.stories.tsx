import type { Meta, StoryObj } from "@storybook/react";

import Tooltip from ".";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="mt-8">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    color: {
      control: "select",
      options: ["primary", "secondary", "info", "success", "warning", "danger"],
    },
    placement: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
    },
    content: {
      control: "text",
    },
  },
  args: {
    content: "Tooltip content",
    placement: "top",
  },
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Primary: Story = {
  args: {
    color: "primary",
    children: <p>Hover me</p>,
  },
};

export const Secondary: Story = {
  args: {
    color: "secondary",
    children: <p>Hover me</p>,
  },
};

export const Info: Story = {
  args: {
    color: "info",
    children: <p>Hover me</p>,
  },
};

export const Success: Story = {
  args: {
    color: "success",
    children: <p>Hover me</p>,
  },
};

export const Warning: Story = {
  args: {
    color: "warning",
    children: <p>Hover me</p>,
  },
};

export const Danger: Story = {
  args: {
    color: "danger",
    children: <p>Hover me</p>,
  },
};
