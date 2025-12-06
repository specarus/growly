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
      className={`flex lg:gap-3 xl:gap-4 items-center justify-between ${
        className ?? ""
      }`}
    >
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-light-yellow lg:px-2 xl:px-3 lg:py-0.5 xl:py-1 lg:text-[8px] xl:text-[10px] 2xl:text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
          <BadgeCheck className="lg:w-3 lg:h-3 xl:w-4 xl:h-4" />
          <span>{badgeLabel}</span>
        </div>
        <div className="space-y-1">
          <h1
            className={`font-bold ${
              className ?? "lg:text-lg xl:text-xl 2xl:text-2xl"
            }`}
          >
            {title}
          </h1>
          <p
            className={`text-muted-foreground max-w-2xl ${
              className ?? "lg:text-[11px] xl:text-xs 2xl:text-sm"
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
