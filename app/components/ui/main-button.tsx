"use client";

import Link from "next/link";
import { useTheme } from "@/app/context/theme-context";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type NextLinkProps = Omit<
  ComponentPropsWithoutRef<typeof Link>,
  "className" | "href"
>;

type MainButtonCommonProps = {
  label: string;
  icon?: ReactNode;
  className?: string;
};

type MainButtonLinkProps = MainButtonCommonProps &
  NextLinkProps & {
    href: ComponentPropsWithoutRef<typeof Link>["href"];
  };

type MainButtonButtonProps = MainButtonCommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type MainButtonProps = MainButtonLinkProps | MainButtonButtonProps;

const mainButtonStyles = `
.main-button {
  text-decoration: none;
  line-height: 1;
  border-radius: 2rem;
  overflow: hidden;
  position: relative;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.05);
  color: hsl(var(--primary));
  border: 1px solid hsl(var(--primary));
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.main-button:disabled {
  cursor: default;
  opacity: 0.6;
}

.main-button .button-decor {
  position: absolute;
  inset: 0;
  background-color: hsl(var(--primary));
  transform: translateX(-100%);
  transition: transform 0.3s;
  z-index: 0;
}

.main-button .button-content {
  display: flex;
  align-items: center;
  font-weight: 500;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.main-button .button__icon {
  width: 48px;
  height: 40px;
  background-color: hsl(var(--primary));
  display: grid;
  place-items: center;
  color: #fff;
}

.main-button .button__icon svg {
  fill: currentColor;
  stroke: currentColor;
}

.main-button .button__text {
  display: inline-block;
  transition: color 0.2s;
  padding: 2px 1.5rem 2px;
  padding-left: 0.75rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 150px;
}

.main-button:hover .button__text {
  color: #fff;
}

.main-button:hover .button-decor {
  transform: translateX(0);
}

.main-button-light {
  background-color: #fff;
}

.main-button-dark {
  background-color: hsl(var(--card));
}
`;

const isLinkButton = (props: MainButtonProps): props is MainButtonLinkProps =>
  typeof props.href !== "undefined";

type ThemeVariant = "light" | "dark";

const getClassNames = (className?: string, variant: ThemeVariant = "light") =>
  [
    "main-button",
    variant === "dark" ? "main-button-dark" : "main-button-light",
    className,
  ]
    .filter(Boolean)
    .join(" ");

const renderContent = (label: string, icon?: ReactNode) => (
  <>
    <span className="button-decor" aria-hidden="true" />
    <span className="button-content">
      {icon ? (
        <span className="button__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="button__text">{label}</span>
    </span>
  </>
);

export default function MainButton(props: MainButtonProps) {
  const { theme } = useTheme();
  const variant: ThemeVariant = theme === "dark" ? "dark" : "light";

  if (isLinkButton(props)) {
    const { href, className, label, icon, ...linkRest } = props;
    const classNames = getClassNames(className, variant);

    return (
      <>
        <Link href={href} className={classNames} {...linkRest}>
          {renderContent(label, icon)}
        </Link>
        <style jsx global>
          {mainButtonStyles}
        </style>
      </>
    );
  }

  const { className, label, icon, type, ...buttonRest } = props;
  const classNames = getClassNames(className, variant);

  return (
    <>
      <button className={classNames} type={type ?? "button"} {...buttonRest}>
        {renderContent(label, icon)}
      </button>
      <style jsx global>
        {mainButtonStyles}
      </style>
    </>
  );
}
