import { useSession } from "next-auth/react";

import clsx from "clsx";
import { CircleChevronDown } from "lucide-react";

import type { Expense, Group } from "@/lib/api/types";

import Button from "../Button";
import Card, { CARD_TYPE } from "../Card";
import Collapse from "../Collapse";
import Spinner from "../Spinner";

const PANEL_TYPE_STYLES = {
  header: {
    [CARD_TYPE.GROUP]: "top-[132px] lg:col-start-3",
    [CARD_TYPE.EXPENSE]: "top-header lg:col-start-1",
  },
  list: {
    [CARD_TYPE.GROUP]: "lg:col-start-3",
    [CARD_TYPE.EXPENSE]: "lg:col-start-1",
  },
};

interface PanelListProps {
  type: CARD_TYPE;
  list?: Expense[] | Group[];
  isActive: boolean;
  handleTogglePanel?: VoidFunction;
}

const PanelList = ({
  type,
  list,
  isActive,
  handleTogglePanel,
}: PanelListProps) => {
  const { status, data } = useSession();

  const user = data?.user;

  return (
    <>
      {/* Header */}
      <div
        className={clsx(
          "sticky z-10 flex items-center justify-between py-4 backdrop-blur-md transition-colors duration-300 lg:static lg:row-start-1",
          PANEL_TYPE_STYLES.header[type],
          isActive && "text-primary lg:text-foreground",
          !isActive && type === CARD_TYPE.GROUP && "bottom-0",
        )}
      >
        <p className="text-xl font-semibold">
          {type === CARD_TYPE.EXPENSE ? "Gastos" : "Grupos"}{" "}
          {list !== undefined && <span>{`(${list.length})`}</span>}
        </p>

        <Button
          aria-label="Toggle show panel list"
          onClick={handleTogglePanel}
          unstyled
          className="hover:text-foreground/90 inline-block h-6 w-6 cursor-pointer align-middle transition-colors duration-300 lg:hidden"
        >
          <CircleChevronDown
            className={clsx(
              "h-6 w-6 transition-transform duration-300",
              isActive && "-rotate-180",
            )}
          />
        </Button>
      </div>

      {/* List */}
      <Collapse
        isOpen={isActive}
        className={clsx(
          "lg:row-start-2 lg:grid-rows-[1fr] lg:opacity-100",
          PANEL_TYPE_STYLES.list[type],
        )}
        contentClassName={clsx("flex flex-1 flex-col gap-y-4")}
      >
        <div
          className={clsx(
            "border-box flex w-full min-w-0 flex-1 flex-col gap-y-4 overflow-hidden",
          )}
        >
          {status === "loading" ? (
            <div className="flex flex-1 items-center justify-center">
              <Spinner />
            </div>
          ) : status === "authenticated" ? (
            <>
              {!!list?.length ? (
                list.map((expense, i) => (
                  <Card
                    key={i}
                    type={type}
                    data={expense}
                    loggedInUser={user}
                  />
                ))
              ) : (
                <p className="text-foreground/75">
                  {CARD_TYPE.EXPENSE
                    ? "No hay gastos registrados. Creá un gasto para empezar a organizar tus finanzas."
                    : "No hay grupos disponibles. Creá un grupo para empezar a organizar tus gastos."}
                </p>
              )}
            </>
          ) : null}
        </div>
      </Collapse>
    </>
  );
};

export default PanelList;
