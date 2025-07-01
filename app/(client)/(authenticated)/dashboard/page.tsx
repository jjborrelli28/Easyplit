"use client";

import { useState } from "react";

import clsx from "clsx";

import ActionModal, { ACTION_TYPE } from "@/components/ActionModal";
import Button from "@/components/Button";
import { CARD_TYPE } from "@/components/Card";
import PageContainer from "@/components/PageContainer";
import PanelList from "@/components/PanelList";

const DashboardPage = () => {
  const [action, setAction] = useState<{
    type: ACTION_TYPE | null;
    modalIsOpen: boolean;
  }>({ type: null, modalIsOpen: false });
  const [activePanel, setActivePanel] = useState<CARD_TYPE>(CARD_TYPE.EXPENSE);

  const handleCreateExpense = () => {
    setAction({ type: ACTION_TYPE.CREATE_EXPENSE, modalIsOpen: true });
  };

  const handleCreateGroup = () => {
    setAction({ type: ACTION_TYPE.CREATE_GROUP, modalIsOpen: true });
  };

  const handleTogglePanel = () =>
    setActivePanel((prevState) =>
      prevState === CARD_TYPE.EXPENSE ? CARD_TYPE.GROUP : CARD_TYPE.EXPENSE,
    );

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

            <section className="border-h-background grid grid-cols-1 gap-x-4 border-t lg:grid-cols-[1fr_1px_1fr]">
              <PanelList
                type={CARD_TYPE.EXPENSE}
                isActive={activePanel === CARD_TYPE.EXPENSE}
                handleTogglePanel={handleTogglePanel}
              />

              {/* Divider */}
              <div
                className={clsx(
                  "bg-h-background sticky top-[132px] z-10 h-[1px] w-full transition-[margin] lg:static lg:col-start-2 lg:row-span-2 lg:h-auto lg:w-[1px]",
                  activePanel === CARD_TYPE.EXPENSE && "mt-4",
                )}
              />

              <PanelList
                type={CARD_TYPE.GROUP}
                isActive={activePanel === CARD_TYPE.GROUP}
                handleTogglePanel={handleTogglePanel}
              />
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
