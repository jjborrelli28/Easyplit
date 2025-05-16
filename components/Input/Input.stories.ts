import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Input from ".";

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {},
  args: {
    id: 'example',
    label: "Label example",
    placeholder: "Placeholder example",
    onChange: fn(),
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  args: {},
};

export const ExampleWithError: Story = {
  args: { error: "Error message example" },
};
