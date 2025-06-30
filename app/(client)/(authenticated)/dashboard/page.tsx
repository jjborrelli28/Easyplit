"use client";

import { useState } from "react";

import clsx from "clsx";
import { CircleChevronDown } from "lucide-react";

import ActionModal, { ACTION_TYPE } from "@/components/ActionModal";
import Button from "@/components/Button";
import Collapse from "@/components/Collapse";
import ExpenseList from "@/components/ExpenseList";
import GroupList from "@/components/GroupList";
import PageContainer from "@/components/PageContainer";

enum PANEL {
  EXPENSES = "expenses",
  GROUPS = "groups",
}

const DashboardPage = () => {
  const [action, setAction] = useState<{
    type: ACTION_TYPE | null;
    modalIsOpen: boolean;
  }>({ type: null, modalIsOpen: false });
  const [activePanel, setActivePanel] = useState<PANEL>(PANEL.EXPENSES);

  const handleCreateExpense = () => {
    setAction({ type: ACTION_TYPE.CREATE_EXPENSE, modalIsOpen: true });
  };

  const handleCreateGroup = () => {
    setAction({ type: ACTION_TYPE.CREATE_GROUP, modalIsOpen: true });
  };

  const handleTogglePanel = () =>
    setActivePanel((prevState) =>
      prevState === PANEL.EXPENSES ? PANEL.GROUPS : PANEL.EXPENSES,
    );

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

            <section className="border-h-background grid grid-cols-1 gap-x-4 border-t lg:grid-cols-[1fr_1px_1fr]">
              {/* Expenses Panel */}
              <div
                className={clsx(
                  "top-header sticky z-10 flex items-center justify-between py-4 backdrop-blur-md transition-colors duration-300 lg:static lg:col-start-1 lg:row-start-1",
                  activePanel === PANEL.EXPENSES &&
                    "text-primary lg:text-foreground",
                )}
              >
                <p className="text-xl font-semibold">Gastos:</p>

                <Button
                  onClick={handleTogglePanel}
                  aria-label="Show or hide panel"
                  unstyled
                  className={clsx(
                    "hover:text-foreground/90 inline-block h-6 w-6 cursor-pointer align-middle transition-colors duration-300 lg:hidden",
                    activePanel === PANEL.EXPENSES &&
                      "text-primary hover:text-primary/90",
                  )}
                >
                  <CircleChevronDown
                    strokeWidth={2.5}
                    className={clsx(
                      "h-5 w-5 transition-transform duration-300",
                      activePanel === PANEL.EXPENSES && "-rotate-180",
                    )}
                  />
                </Button>
              </div>

              <Collapse
                isOpen={activePanel === PANEL.EXPENSES}
                containerClassName={clsx("flex flex-1 flex-col gap-y-4")}
                className="lg:col-start-1 lg:row-start-2 lg:grid-rows-[1fr] lg:opacity-100"
              >
                <ExpenseList className="w-full min-w-0 overflow-hidden" />
              </Collapse>

              {/* Divider */}
              <div
                className={clsx(
                  "bg-h-background sticky top-[132px] z-10 h-[1px] w-full transition-[margin] lg:static lg:col-start-2 lg:row-span-2 lg:h-auto lg:w-[1px]",
                  activePanel === PANEL.EXPENSES && "mt-4",
                )}
              />

              {/* Groups Panel */}
              <div
                className={clsx(
                  "sticky z-10 flex items-center justify-between py-4 backdrop-blur-md transition-colors duration-300 lg:static lg:col-start-3 lg:row-start-1",
                  activePanel === PANEL.GROUPS
                    ? "text-primary lg:text-foreground top-[132px]"
                    : "bottom-0",
                )}
              >
                <p className="text-xl font-semibold">Grupos:</p>

                <Button
                  onClick={handleTogglePanel}
                  aria-label="Show or hide panel"
                  unstyled
                  className={clsx(
                    "hover:text-foreground/90 inline-block h-6 w-6 cursor-pointer align-middle transition-colors duration-300 lg:hidden",
                    activePanel === PANEL.GROUPS &&
                      "text-primary hover:text-primary/90",
                  )}
                >
                  <CircleChevronDown
                    strokeWidth={2.5}
                    className={clsx(
                      "h-5 w-5 transition-transform duration-300",
                      activePanel === PANEL.GROUPS && "-rotate-180",
                    )}
                  />
                </Button>
              </div>

              <Collapse
                isOpen={activePanel === PANEL.GROUPS}
                containerClassName={clsx("flex flex-1 flex-col gap-y-4 ")}
                className="lg:col-start-3 lg:row-start-2 lg:grid-rows-[1fr] lg:opacity-100"
              >
                <GroupList className="w-full min-w-0 overflow-hidden" />
              </Collapse>
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
