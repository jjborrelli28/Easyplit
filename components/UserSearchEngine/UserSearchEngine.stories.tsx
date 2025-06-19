import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import type { UserData } from "@/lib/api/types";

import NextAuthProvider from "@/providers/NextAuthProvider";
import QueryClientProvider from "@/providers/QueryClientProvider";

import UserSearchEngine from ".";

const meta = {
  title: "Components/UserSearchEngine",
  component: UserSearchEngine,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof UserSearchEngine>;

export default meta;

type Story = StoryObj<typeof UserSearchEngine>;

// TODO: Add mockup data
export const Example: Story = {
  render: (args) => {
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    return (
      <QueryClientProvider {...args}>
        <NextAuthProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
          <div className="w-full max-w-md">
            <UserSearchEngine
              placeholder="Search by name or email"
              onSelect={(user) => {
                setSelectedUser(user);
                alert(`Select: ${user.name}`);
              }}
            />

            {selectedUser && (
              <p className="mt-4 text-sm text-gray-600">
                Selected: {selectedUser.name}
              </p>
            )}
          </div>
        </NextAuthProvider>
      </QueryClientProvider>
    );
  },
};
