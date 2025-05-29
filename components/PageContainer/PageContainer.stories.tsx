import type { Meta, StoryObj } from "@storybook/react";

import PageContainer from ".";

const meta = {
  title: "Components/PageContainer",
  component: PageContainer,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof PageContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  args: {},

  render: (args) => {
    return (
      <PageContainer {...args}>
        <h1 className="text-foreground text-3xl font-semibold">
          PageContainer example
        </h1>
      </PageContainer>
    );
  },
};
