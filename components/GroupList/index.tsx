import { useSession } from "next-auth/react";

import useGetLinkedGroups from "@/hooks/groups/useGetLinkedGroups";

import clsx from "clsx";

import Card, { CARD_TYPE } from "../Card";
import Spinner from "../Spinner";

interface GroupList {
  className?: string;
}

const GroupList = ({ className }: GroupList) => {
  const { status, data } = useSession();

  const user = data?.user;

  const { data: groups } = useGetLinkedGroups(user?.id);

  return (
    <div className={clsx("border-box flex flex-1 flex-col gap-y-4", className)}>
      {status === "loading" ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      ) : status === "authenticated" ? (
        <>
          {!!groups?.length ? (
            groups.map((group, i) => (
              <Card
                key={i}
                type={CARD_TYPE.GROUP}
                data={group}
                loggedInUser={user}
              />
            ))
          ) : (
            <p className="text-foreground/75">
              No hay grupos disponibles. Creá un grupo para empezar a organizar
              tus gastos.
            </p>
          )}
        </>
      ) : null}
    </div>
  );
};

export default GroupList;
