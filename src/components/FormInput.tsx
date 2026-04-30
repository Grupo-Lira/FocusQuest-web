type Props = {
  label: string;
  type: string;
  placeholder: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function FormInput({
  label,
  type,
  placeholder,
  name,
  value,
  onChange,
}: Readonly<Props>) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-[var(--primary)] font-orbitron uppercase font-semibold text-xs tracking-wide">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        className="border-b border-gray-300 py-1.5 text-[var(--text)] outline-none focus:border-b-[var(--primary)] bg-transparent w-full transition-colors"
      />
    </div>
  );
}