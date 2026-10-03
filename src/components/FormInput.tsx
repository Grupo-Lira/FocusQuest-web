import { useT } from "@/i18n/client";

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
  const t = useT();
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-[var(--primary)] font-orbitron uppercase font-semibold text-xs tracking-wide">
        {t(label)}
      </label>
      <input
        type={type}
        placeholder={t(placeholder)}
        name={name}
        value={value}
        onChange={onChange}
        className="border-b border-gray-300 py-1.5 text-[var(--text)] outline-none focus:border-b-[var(--primary)] bg-transparent w-full transition-colors"
      />
    </div>
  );
}
