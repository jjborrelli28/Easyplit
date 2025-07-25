import { useArgs } from "@storybook/preview-api";
import type { Meta, StoryObj } from "@storybook/react";

import Collapse from ".";
import Button from "../Button";

const meta = {
  title: "Components/Collapse",
  component: Collapse,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof Collapse>;

export default meta;

type Story = StoryObj<typeof Collapse>;

export const Example: Story = {
  args: {
    isOpen: false,
  },

  render: (args) => {
    const [{ isOpen }, updateArgs] = useArgs();

    const handleToggleCollapse = () => {
      updateArgs({ isOpen: !isOpen });
    };

    return (
      <div className="flex flex-col gap-y-4">
        <Button onClick={handleToggleCollapse} fullWidth>
          Toggle collapse
        </Button>

        <hr className="border-foreground" />

        <Collapse {...args} isOpen={isOpen}>
          <p className="text-foreground border-h-foreground border p-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </Collapse>
      </div>
    );
  },
};
