"use client";

import { useState } from "react";

import ActionModal, { ACTION_TYPE } from "@/components/ActionModal";
import Button from "@/components/Button";
import ExpenseList from "@/components/ExpenseList";
import GroupList from "@/components/GroupList";
import PageContainer from "@/components/PageContainer";

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
          <div className="flex flex-1 flex-col gap-y-4">
            <h1 className="text-3xl font-bold">Panel de control</h1>

            <hr className="border-h-background" />

            <section className="flex gap-x-4">
              <Button onClick={handleCreateExpense} className="w-32 max-w-none">
                Crear gasto
              </Button>

              <Button
                color="info"
                onClick={handleCreateGroup}
                className="w-32 max-w-none"
              >
                Crear grupo
              </Button>
            </section>

            <section className="border-h-background grid grid-cols-1 grid-rows-2 gap-4 border-t pt-4 lg:grid-cols-[1fr_1px_1fr] lg:grid-rows-1">
              <ExpenseList className="w-full min-w-0 overflow-hidden" />

              <div className="bg-h-background hidden w-[1px] lg:block" />

              <GroupList className="w-full min-w-0 overflow-hidden" />
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
