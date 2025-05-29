import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { CheckCircle, CircleAlert, CircleX, MailCheck } from "lucide-react";

import MessageCard from "@/components/MessageCard";

const contentMockup =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const meta: Meta<typeof MessageCard> = {
  title: "Components/MessageCard",
  component: MessageCard,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {},
  args: {
    title: "Example Title",
    children: contentMockup,
    actionLabel: "onAction example",
    onAction: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    icon: MailCheck,
  },
};

export const Secondary: Story = {
  args: {
    color: "secondary",
    icon: MailCheck,
  },
};

export const Success: Story = {
  args: {
    color: "success",
    icon: CheckCircle,
  },
};

export const Warning: Story = {
  args: {
    color: "warning",
    icon: CircleAlert,
  },
};

export const Danger: Story = {
  args: {
    color: "danger",
    icon: CircleX,
  },
};
