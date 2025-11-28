import { BadgeCheck } from "lucide-react";
import type React from "react";

type PageHeadingProps = {
  badgeLabel: string;
  title: React.ReactNode;
  description: React.ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
  actions?: React.ReactNode;
  className?: string;
};

const PageHeading: React.FC<PageHeadingProps> = ({
  badgeLabel,
  title,
  description,
  actions,
  className,
}) => {
  return (
    <div
      className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${
        className ?? ""
      }`}
    >
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-light-yellow px-3 py-1 xl:text-[10px] 2xl:text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
          <BadgeCheck className="w-4 h-4" />
          <span>{badgeLabel}</span>
        </div>
        <div className="space-y-1">
          <h1 className={`font-bold ${className ?? "xl:text-xl 2xl:text-2xl"}`}>
            {title}
          </h1>
          <p
            className={`text-muted-foreground max-w-2xl ${
              className ?? "xl:text-xs 2xl:text-sm"
            }`}
          >
            {description}
          </p>
        </div>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
};

export default PageHeading;
