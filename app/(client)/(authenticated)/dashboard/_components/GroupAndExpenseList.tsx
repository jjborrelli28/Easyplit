import { useState } from "react";

import type { Session } from "next-auth";

import clsx from "clsx";

import useGetMyGroupsAndExpenses from "@/hooks/user/useGetMyGroupsAndExpenses";

import { CARD_TYPE } from "@/components/Card";
import PanelList from "@/components/PanelList";
import Spinner from "@/components/Spinner";

interface GroupAndExpenseListProps {
  user?: Session["user"];
}

const GroupAndExpenseList = ({ user }: GroupAndExpenseListProps) => {
  const { data, isPending } = useGetMyGroupsAndExpenses(user?.id);

  const [activePanel, setActivePanel] = useState<CARD_TYPE>(CARD_TYPE.GROUP);

  const handleTogglePanel = () =>
    setActivePanel((prevState) =>
      prevState === CARD_TYPE.EXPENSE ? CARD_TYPE.GROUP : CARD_TYPE.EXPENSE,
    );

  if (isPending)
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );

  return (
    <section className="border-h-background grid grid-cols-1 gap-x-4 border-t lg:grid-cols-[1fr_1px_1fr]">
      <PanelList
        type={CARD_TYPE.GROUP}
        list={data?.groups}
        isActive={activePanel === CARD_TYPE.GROUP}
        handleTogglePanel={handleTogglePanel}
      />

      <div
        className={clsx(
          "bg-h-background sticky top-[132px] z-10 h-[1px] w-full transition-[margin] lg:static lg:col-start-2 lg:row-span-2 lg:h-auto lg:w-[1px]",
          activePanel === CARD_TYPE.EXPENSE && "mt-4",
        )}
      />

      <PanelList
        type={CARD_TYPE.EXPENSE}
        list={data?.expenses}
        isActive={activePanel === CARD_TYPE.EXPENSE}
        handleTogglePanel={handleTogglePanel}
      />
    </section>
  );
};

export default GroupAndExpenseList;
