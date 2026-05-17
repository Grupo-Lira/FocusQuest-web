type RadioProps = {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function RadioGroup({
  label,
  name,
  value,
  checked,
  onChange,
}: Readonly<RadioProps>) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 accent-[var(--primary)]"
      />
      <span className="text-[var(--text)] font-medium">{label}</span>
    </label>
  );
}