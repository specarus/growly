interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  ...rest
}) => {
  const baseStyles =
    "w-full rounded-full flex items-center justify-center select-none gap-2 cursor-pointer";

  const finalClassName = `${baseStyles} ${className}`;

  return (
    <button className={finalClassName} {...rest}>
      {children}
    </button>
  );
};

export default Button;
