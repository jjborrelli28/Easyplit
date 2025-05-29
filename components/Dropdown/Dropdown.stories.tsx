import type { Meta, StoryObj } from "@storybook/react";

import Dropdown from ".";

const meta: Meta<typeof Dropdown> = {
  title: "Components/Dropdown",
  component: Dropdown,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["contained", "outlined", "text"],
    },
    color: {
      control: { type: "select" },
      options: ["primary", "secondary", "success", "warning", "danger"],
    },
  },
  args: {
    variant: "contained",
    color: "primary",
  },
};

export default meta;

type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {
  args: {
    label: "Options",
    color: "primary",
    items: [
      {
        label: "Option 1",
        onClick: () => alert("Option 1 is clicked"),
      },
      {
        label: "Option 2",
        onClick: () => alert("Option 2 is clicked"),
      },
      {
        label: "Option 3",
        onClick: () => alert("Option 3 is clicked"),
      },
    ],
  },

  render: (args) => {
    return (
      <div className="container mx-auto flex w-full justify-end">
        <Dropdown {...args} />
      </div>
    );
  },
};
