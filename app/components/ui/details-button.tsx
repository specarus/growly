import Link from "next/link";

interface DetailsButtonProps {
  href?: string;
  label?: string;
}

export default function DetailsButton({
  href,
  label = "View Details",
}: DetailsButtonProps) {
  const className =
    "text-muted-foreground hover:underline xl:text-xs 2xl:text-sm";

  if (href) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return <button className={className}>{label}</button>;
}
