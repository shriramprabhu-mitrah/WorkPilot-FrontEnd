import { CircleSlash } from "lucide-react";

export const PermissionIcon = ({ color }: { color: string }) => (
  <span className="w-4 h-4 shrink-0 mt-0.5">
    <CircleSlash size={14} style={{ color }} />
  </span>
);
