import type { Meta, StoryObj } from "@storybook/react";

import PageUnderConstructionMessage from ".";

const meta = {
  title: "Components/PageUnderConstructionMessage",
  component: PageUnderConstructionMessage,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof PageUnderConstructionMessage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  args: {},
};
