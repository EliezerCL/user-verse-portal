import { useAppState } from "@/lib/store";

export function Logo({ size = 56 }: { size?: number }) {
  const { logo } = useAppState();
  if (logo) return <img src={logo} alt="Logo" style={{ height: size }} className="w-auto object-contain" />;
  return (
    <div
      style={{ width: size, height: size }}
      className="grid place-items-center rounded-2xl bg-primary font-display text-xl font-bold text-primary-foreground shadow-glow"
    >
      ◆
    </div>
  );
}
