interface ProfileFieldProps {
  label: string;
  value: string;
}

export default function ProfileField({ label, value }: ProfileFieldProps) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg text-slate-200">{value || "—"}</p>
    </div>
  );
}