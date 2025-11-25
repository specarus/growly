import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "ghost" | "text";

interface PillButtonBaseProps {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

type PillButtonLinkProps = PillButtonBaseProps &
  ComponentPropsWithoutRef<typeof Link> & {
    href: ComponentPropsWithoutRef<typeof Link>["href"];
  };

type PillButtonNativeProps = PillButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type PillButtonProps = PillButtonLinkProps | PillButtonNativeProps;

const variantStyles: Record<Variant, string> = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full xl:px-3 xl:py-1 2xl:py-1.5 xl:text-[11px] 2xl:text-xs font-semibold text-white bg-primary border border-transparent shadow-sm transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 disabled:cursor-not-allowed",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-full xl:px-3 xl:py-1 2xl:py-1.5 xl:text-[11px] 2xl:text-xs font-semibold text-foreground bg-white border border-gray-200 shadow-sm transition hover:border-primary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 disabled:cursor-not-allowed",
  text: "inline-flex items-center gap-1 xl:text-[11px] 2xl:text-xs font-semibold text-primary transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
};

const getClassName = (variant: Variant, extra?: string) =>
  [variantStyles[variant], extra].filter(Boolean).join(" ");

const isLinkButton = (props: PillButtonProps): props is PillButtonLinkProps =>
  typeof (props as PillButtonLinkProps).href !== "undefined";

const PillButton = (props: PillButtonProps) => {
  if (isLinkButton(props)) {
    const {
      variant = "primary",
      className,
      href,
      children,
      ...linkRest
    } = props;

    return (
      <Link
        href={href}
        className={getClassName(variant, className)}
        {...linkRest}
      >
        {children}
      </Link>
    );
  }

  const {
    variant = "primary",
    className,
    children,
    type,
    ...buttonRest
  } = props;

  return (
    <button
      type={type ?? "button"}
      className={getClassName(variant, className)}
      {...buttonRest}
    >
      {children}
    </button>
  );
};

export default PillButton;
