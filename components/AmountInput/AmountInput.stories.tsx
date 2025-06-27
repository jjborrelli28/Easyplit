import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import AmountInput, { initialAmoutValue } from ".";

const meta = {
  title: "Components/AmountInput",
  component: AmountInput,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    label: "Amount",
    currencySymbol: "$",
  },
} satisfies Meta<typeof AmountInput>;

export default meta;

type Story = StoryObj<typeof AmountInput>;

export const Example: Story = {
  render: (args) => {
    const [value, setValue] = useState(initialAmoutValue);

    return (
      <div className="border-h-background w-md border p-4">
        <AmountInput {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};
