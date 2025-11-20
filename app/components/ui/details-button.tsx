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
    "cursor-pointer xl:text-xs 2xl:text-sm text-yellow-soft-foreground/80 hover:text-yellow-soft-foreground";

  if (href) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return <button className={className}>{label}</button>;
}
