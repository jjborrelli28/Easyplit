import type { Meta, StoryObj } from "@storybook/react";

import QueryClientProvider from "@/react-query/QueryClientProvider";

import { ThemeProvider } from "next-themes";

import Header from ".";

const meta = {
  title: "Components/Header",
  component: Header,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

export const HomepageExample: Story = {
  args: {},
  render: (args) => {
    return (
      <QueryClientProvider {...args}>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </QueryClientProvider>
    );
  },
};
