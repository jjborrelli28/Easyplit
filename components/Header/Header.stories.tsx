import type { Meta, StoryObj } from "@storybook/react";

import { ThemeProvider } from "next-themes";

import NextAuthProvider from "@/providers/NextAuthProvider";
import QueryClientProvider from "@/providers/QueryClientProvider";

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
        <NextAuthProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
          <ThemeProvider>
            <Header />
          </ThemeProvider>
        </NextAuthProvider>
      </QueryClientProvider>
    );
  },
};
