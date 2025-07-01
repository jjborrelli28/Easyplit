import Image from "next/image";

import { useSession } from "next-auth/react";

import clsx from "clsx";

interface UserCardProps {
  id?: string | null;
  name: string | null;
  email?: string | null;
  image: string | null;
  className?: string;
}

const UserCard = ({ id, name, email, image, className }: UserCardProps) => {
  const { data } = useSession();

  const loggedUser = data?.user;

  if (!loggedUser || !name) return null;

  return (
    <div className={clsx("flex items-center gap-x-4", className)}>
      {image && (
        <Image
          alt="User avatar"
          src={image}
          height={42}
          width={42}
          className="rounded-full"
        />
      )}

      <div>
        <p className="font-medium">
          {name}
          {id === loggedUser.id && (
            <span className="text-foreground/75 text-xs">{" (Tú)"}</span>
          )}
        </p>

        {email && <p className="text-foreground/75 text-sm">{email}</p>}
      </div>
    </div>
  );
};

export default UserCard;
