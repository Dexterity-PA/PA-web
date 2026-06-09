import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function GlassPanel({ children, className = "" }: Props) {
  return (
    <div className={`bg-glass border border-border backdrop-blur-[20px] ${className}`}>
      {children}
    </div>
  );
}
