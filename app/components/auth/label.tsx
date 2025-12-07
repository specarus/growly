interface LabelProps {
  children: React.ReactNode;
  htmlFor: string;
}

const Label: React.FC<LabelProps> = ({ children, htmlFor }) => {
  return (
    <label
      className="text-foreground lg:text-[10px] xl:text-[12px] 2xl:text-[14px] font-medium"
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
};

export default Label;
