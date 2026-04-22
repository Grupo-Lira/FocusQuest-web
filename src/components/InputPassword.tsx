import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type Props = {
  placeholder: string;
  name: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
};

const INPUT_CLASS =
  "bg-[var(--input-bg)] rounded-2xl w-96 text-[var(--text)] p-3 focus:outline-none font-semibold" as const;

const getInputType = (showPassword: boolean) => {
  if (showPassword === true) return "text";
  return "password";
};

export const InputPassword = ({
  placeholder,
  name,
  onChange,
  value,
}: Readonly<Props>) => {
  const [showPassword, setShowPassword] = useState(false);

  const onToggleVisibility = () => setShowPassword(!showPassword);
  const inputType = getInputType(showPassword);

  return (
    <div className="relative">
      <input
        type={inputType}
        placeholder={placeholder}
        onChange={onChange}
        name={name}
        value={value}
        className={INPUT_CLASS}
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute right-4 top-3.5 text-gray-500"
      >
        {showPassword === true ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
};
