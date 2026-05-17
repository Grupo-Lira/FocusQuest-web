type Props = {
  message?: string;
};

export function Loading({ message }: Props) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-transparent gap-4">
      <div className="relative flex items-center justify-center w-16 h-16">
        <div className="absolute w-full h-full border-4 border-gray-200/20 rounded-full"></div>
        <div className="absolute w-full h-full border-4 border-[var(--primary)] rounded-full border-t-transparent animate-spin"></div>
      </div>

      <p className="text-[var(--text)] text-white font-medium text-lg animate-pulse tracking-wide">
        {message}
      </p>
    </div>
  );
}
