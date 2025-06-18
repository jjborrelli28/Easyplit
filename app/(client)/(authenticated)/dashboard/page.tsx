"use client";

import { useState } from "react";

import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";
import ActionModal, { ACTION_TYPE } from "./_components/ActionModal";

const DashboardPage = () => {
  const [action, setAction] = useState<{
    type: ACTION_TYPE | null;
    modalIsOpen: boolean;
  }>({ type: null, modalIsOpen: false });

  const handleCreateExpense = () => {
    setAction({ type: ACTION_TYPE.CREATE_EXPENSE, modalIsOpen: true });
  };

  const handleCreateGroup = () => {
    setAction({ type: ACTION_TYPE.CREATE_GROUP, modalIsOpen: true });
  };

  return (
    <>
      <PageContainer className="border-h-background !px-0 md:border-r">
        <div className="border-h-background flex flex-1 flex-col border-t p-4">
          <div className="flex flex-col gap-y-4">
            <h1 className="text-3xl font-bold">Panel de control</h1>

            <hr className="border-h-background" />

            <section className="flex gap-x-4">
              <Button
                onClick={handleCreateExpense}
                color="secondary"
                className="w-32 max-w-none"
              >
                Crear gasto
              </Button>

              <Button onClick={handleCreateGroup} className="w-32 max-w-none">
                Crear grupo
              </Button>
            </section>
          </div>
        </div>
      </PageContainer>

      <ActionModal
        type={action.type}
        isOpen={action.modalIsOpen}
        onClose={() => setAction({ type: null, modalIsOpen: false })}
      />
    </>
  );
};

export default DashboardPage;
