import { Eye, EyeOff } from "lucide-react";
import React from "react";

export const InputPassword = ({
  placeholder,
  name,
  onChange,
}: Readonly<{
  placeholder: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}>) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
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
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-3.5 text-gray-500"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
};
