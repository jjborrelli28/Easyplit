import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import Modal from ".";
import Button from "../Button";

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
  parameters: {},
  tags: ["autodocs"],
  argTypes: {},
  args: {},
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Abrir Modal</Button>

        <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="flex flex-col gap-y-8">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <div className="flex justify-end gap-x-4">
              <Button
                onClick={() => setIsOpen(false)}
                variant="outlined"
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  alert("Confirmed action");
                  setIsOpen(false);
                }}
                color="success"
              >
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
  args: {
    title: "Modal de prueba",
  },
};
