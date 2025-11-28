type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input: React.FC<InputProps> = ({ ...props }) => {
  return (
    <input
      className="xl:pl-12 2xl:pl-14 pr-3 flex xl:h-10 w-full rounded-full border border-input shadow-inner bg-background py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 xl:text-xs 2xl:text-sm"
      {...props}
    />
  );
};

export default Input;
