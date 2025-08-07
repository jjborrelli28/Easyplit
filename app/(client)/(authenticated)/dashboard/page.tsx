"use client";

import { useState } from "react";

import { useSession } from "next-auth/react";

import ActionModal, { ACTION_TYPE } from "@/components/ActionModal";
import Button from "@/components/Button";
import PageContainer from "@/components/PageContainer";
import GroupAndExpenseList from "./_components/GroupAndExpenseList";

const DashboardPage = () => {
  const { data } = useSession();

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

  const user = data?.user;

  return (
    <>
      <PageContainer className="border-h-background !px-0 md:border-r">
        <div className="border-h-background flex flex-1 flex-col border-t px-4 py-8 lg:px-8">
          <div className="flex flex-1 flex-col gap-y-8">
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

            <GroupAndExpenseList />
          </div>
        </div>
      </PageContainer>

      <ActionModal
        type={action.type}
        user={user}
        isOpen={action.modalIsOpen}
        onClose={() => setAction({ type: null, modalIsOpen: false })}
      />
    </>
  );
};

export default DashboardPage;
