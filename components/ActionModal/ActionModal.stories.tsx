import type { Meta, StoryObj } from "@storybook/react";
import { useArgs } from "storybook/internal/preview-api";

import NextAuthProvider from "@/providers/NextAuthProvider";
import QueryClientProvider from "@/providers/QueryClientProvider";

import ActionModal, { ACTION_TYPE } from ".";
import Button from "../Button";

const meta = {
  title: "Components/ActionModal",
  component: ActionModal,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof ActionModal>;

export default meta;

type Story = StoryObj<typeof ActionModal>;

export const CreateExpenseExample: Story = {
  render: (args) => {
    const [{ isOpen }, updateArgs] = useArgs();

    return (
      <QueryClientProvider {...args}>
        <NextAuthProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
          <Button onClick={() => updateArgs({ isOpen: true })}>
            Create Expense
          </Button>

          <ActionModal
            {...args}
            type={ACTION_TYPE.CREATE_EXPENSE}
            isOpen={isOpen}
            onClose={() => updateArgs({ isOpen: false })}
          />
        </NextAuthProvider>
      </QueryClientProvider>
    );
  },
};

export const CreateGroupExample: Story = {
  render: (args) => {
    const [{ isOpen }, updateArgs] = useArgs();

    return (
      <QueryClientProvider {...args}>
        <NextAuthProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
          <Button onClick={() => updateArgs({ isOpen: true })}>
            Create Group
          </Button>

          <ActionModal
            {...args}
            type={ACTION_TYPE.CREATE_GROUP}
            isOpen={isOpen}
            onClose={() => updateArgs({ isOpen: false })}
          />
        </NextAuthProvider>
      </QueryClientProvider>
    );
  },
};
