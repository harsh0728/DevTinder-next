import { LucideIcon } from "lucide-react";

interface NavButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

export default function NavButton({ icon: Icon, label, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-500/20 transition duration-200 text-slate-300 hover:text-indigo-300"
    >
      <Icon size={20} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}