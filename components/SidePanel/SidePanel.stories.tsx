import type { Meta, StoryObj } from "@storybook/react";

import SidePanel from ".";

const meta = {
  title: "Components/SidePanel",
  component: SidePanel,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof SidePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ExampleInDashboard: Story = {
  args: {},
  parameters: {
    nextjs: {
      navigation: { pathname: "/dashboard" },
    },
  },

  render: () => {
    return (
      <div className="flex h-screen">
        <SidePanel />
      </div>
    );
  },
};
