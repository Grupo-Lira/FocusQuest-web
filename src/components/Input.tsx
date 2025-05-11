export const Input = ({
  type,
  placeholder,
  name,
  onChange,
}: Readonly<{
  type: string;
  placeholder: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}>) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      name={name}
      className="
            bg-[var(--input-bg)] 
            rounded-2xl
            w-96
            text-[var(--text)]
            p-3  
            focus:outline-none 
            font-semibold
            "
    />
  );
};
