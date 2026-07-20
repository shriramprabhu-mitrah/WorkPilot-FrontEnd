import { colors } from "@/src/styles/colors";
import { PermissionIcon } from "./permissionIcon";
import { RoleCard } from "@/src/types/teams";

export const RoleCardView = ({ role }: { role: RoleCard }) => (
  <div
    className="bg-white rounded-xl border p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
    style={{ borderColor: colors.gray200 }}
  >
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: role.dotColor }}
        />
        <span className="font-bold text-sm" style={{ color: colors.gray900 }}>
          {role.name}
        </span>
      </div>
      <p
        className="text-xs ml-4.5"
        style={{ color: role.dotColor, paddingLeft: "18px" }}
      >
        {role.description}
      </p>
    </div>

    <ul className="flex flex-col gap-2">
      {role.permissions.map((perm) => (
        <li
          key={perm}
          className="flex items-start gap-2 text-xs"
          style={{ color: colors.gray700 }}
        >
          <PermissionIcon color={role.dotColor} />
          {perm}
        </li>
      ))}
    </ul>
  </div>
);
