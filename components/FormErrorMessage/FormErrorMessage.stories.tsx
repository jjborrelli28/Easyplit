import { useArgs } from "@storybook/preview-api";
import type { Meta, StoryObj } from "@storybook/react";

import FormErrorMessage from ".";
import Button from "../Button";

const meta: Meta<typeof FormErrorMessage> = {
  title: "Components/FormErrorMessage",
  component: FormErrorMessage,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {},
  args: {
    message: null,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const mockupErrorMessage = [
  "This field is required.",
  "The value entered is invalid.",
];

export const Example: Story = {
  render: (args) => {
    const [{ message }, updateArgs] = useArgs();

    const handleToggleFormErrorMessage = () => {
      if (message) {
        updateArgs({ message: null });
      } else {
        updateArgs({ message: mockupErrorMessage });
      }
    };

    return (
      <div className="flex flex-col gap-y-4">
        <Button onClick={handleToggleFormErrorMessage} fullWidth>
          {message ? "Hide error message" : "Show error message"}
        </Button>

        <hr className="border-foreground" />

        <FormErrorMessage {...args} />
      </div>
    );
  },
};
