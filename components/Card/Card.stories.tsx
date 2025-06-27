import type { Meta, StoryObj } from "@storybook/react";

import Card, { CARD_TYPE } from ".";

const loggedInUserMockup = {
  name: "Participant 1",
  email: "participant_1@test.com",
  image:
    "https://ui-avatars.com/api/?name=Participant&background=012f4a&color=ffffff&size=128",
  id: "cmc0sy5l60000p8644kxtmlvq1",
  hasPassword: true,
};

const participantsMockup = [
  {
    id: "cmc50f2cc000wp8w553g8a8c01",
    userId: "cmc0sy5l60000p8644kxtmlvq1",
    groupId: "cmc50f2cb000up8w5gr5lzz4q",
    user: {
      id: "cmc0sy5l60000p8644kxtmlvq1",
      name: "Participant 1",
      email: "participant_1@test.com",
      emailVerified: null,
      image:
        "https://ui-avatars.com/api/?name=Participant&background=012f4a&color=ffffff&size=128",
      password: null,
      verifyToken: null,
      verifyTokenExp: null,
      resetToken: null,
      resetTokenExp: null,
      createdAt: "2025-06-17T17:33:40.939Z",
    },
  },
  {
    id: "cmc50f2cc000wp8w553g8a8c02",
    userId: "cmc0sy5l60000p8644kxtmlvq2",
    groupId: "cmc50f2cb000up8w5gr5lzz4q",
    user: {
      id: "cmc0sy5l60000p8644kxtmlvq2",
      name: "Participant 2",
      email: "participant_2@test.com",
      emailVerified: null,
      image:
        "https://ui-avatars.com/api/?name=Participant&background=012f4a&color=ffffff&size=128",
      password: null,
      verifyToken: null,
      verifyTokenExp: null,
      resetToken: null,
      resetTokenExp: null,
      createdAt: "2025-06-17T17:33:40.939Z",
    },
  },
  {
    id: "cmc50f2cc000wp8w553g8a8c03",
    userId: "cmc0sy5l60000p8644kxtmlvq3",
    groupId: "cmc50f2cb000up8w5gr5lzz4q",
    user: {
      id: "cmc0sy5l60000p8644kxtmlvq3",
      name: "Participant 3",
      email: "participant_3@test.com",
      emailVerified: null,
      image:
        "https://ui-avatars.com/api/?name=Participant&background=012f4a&color=ffffff&size=128",
      password: null,
      verifyToken: null,
      verifyTokenExp: null,
      resetToken: null,
      resetTokenExp: null,
      createdAt: "2025-06-17T17:33:40.939Z",
    },
  },
];

const meta: Meta<typeof Card> = {
  component: Card,
  title: "Components/Card",
  parameters: {},
  tags: ["autodocs"],
  argTypes: {},
  args: {},
};

export default meta;

type Story = StoryObj<typeof meta>;

const expenseMockup = {
  id: "cmc50f2cb000up8w5gr5lzz4q",
  name: "Test 1",
  createdAt: "2025-06-20T16:13:51.858Z",
  paidById: "cmc0sy5l60000p8644kxtmlvq1",
  amount: 1000,
  participants: participantsMockup,
};

export const Expense: Story = {
  args: {
    type: CARD_TYPE.EXPENSE,
    data: expenseMockup,
    loggedInUser: loggedInUserMockup,
  },
};

const groupMockup = {
  id: "cmc50f2cb000up8w5gr5lzz4q",
  name: "Test 1",
  createdAt: "2025-06-20T16:13:51.858Z",
  createdById: "cmc0sy5l60000p8644kxtmlvq1",
  members: participantsMockup,
};

export const Group: Story = {
  args: {
    type: CARD_TYPE.GROUP,
    data: groupMockup,
    loggedInUser: loggedInUserMockup,
  },
};
