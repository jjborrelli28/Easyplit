"use client";

import { usePathname } from "next/navigation";

import clsx from "clsx";
import { ClockFading, List, LucideIcon, MonitorCog } from "lucide-react";

import Button, { type ButtonProps } from "../Button";

const SidePanel = () => {
  const pathname = usePathname();

  return (
    <aside className="mt-header from-h-background to-background hidden w-sm bg-gradient-to-l md:block xl:w-md xl:min-w-md">
      <nav className="flex flex-col">
        <CTA
          icon={MonitorCog}
          isActive={pathname === "/dashboard"}
          href="/dashboard"
        >
          Panel de control
        </CTA>

        <CTA
          icon={ClockFading}
          isActive={pathname === "/recent-activity"}
          href="/recent-activity"
          className="border-t-0"
        >
          Actividad reciente
        </CTA>

        <CTA
          icon={List}
          isActive={pathname === "/all-expenses"}
          href="/all-expenses"
          className="border-t-0"
        >
          Todos los gastos
        </CTA>
      </nav>
    </aside>
  );
};

export default SidePanel;

type CTAProps = ButtonProps & {
  icon?: LucideIcon;
  isActive?: boolean;
};

const CTA = ({
  children,
  icon: Icon,
  isActive,
  className,
  ...restProps
}: CTAProps) => (
  <Button
    unstyled
    className={clsx(
      "hover:bg-background/75 border-l-h-background border-h-background flex cursor-pointer items-center gap-x-4 border border-l-2 p-4 text-lg font-semibold transition-colors duration-300",
      isActive && "border-l-primary bg-background pointer-events-none",
      className,
    )}
    disabled={isActive}
    {...restProps}
  >
    {Icon && <Icon className={clsx(isActive && "text-primary")} />}

    {children}
  </Button>
);
