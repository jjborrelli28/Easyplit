import type { Meta, StoryObj } from "@storybook/react";
import { useArgs } from "storybook/internal/preview-api";

import MenuButton from ".";

const meta: Meta<typeof MenuButton> = {
  title: "Components/MenuButton",
  component: MenuButton,
  tags: ["autodocs"],
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  args: {
    isOpen: true,
  },

  render: (args) => {
    const [{ isOpen }, updateArgs] = useArgs();

    const handleToggleMenu = () => {
      updateArgs({ isOpen: !isOpen });
    };

    return <MenuButton {...args} isOpen={isOpen} onClick={handleToggleMenu} />;
  },
};
