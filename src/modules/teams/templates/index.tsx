"use client";

import { UserPlus } from "lucide-react";
import { colors } from "@/src/styles/colors";
import { MemberCard } from "@/src/modules/teams/components/membercard";
import { RoleCardView } from "../components/rolecared";
import { MEMBERS, ROLES } from "../data";
import { WpButton } from "@/src/app/components/common/button";

export const TeamTemplate = () => (
  <div className="flex flex-col gap-8 h-full overflow-y-auto [scrollbar-width:thin]">
    {/* Header */}
    <div className="flex items-start justify-between gap-4 flex-shrink-0">
      <div>
        <h1
          className="text-xl sm:text-2xl font-bold"
          style={{ color: colors.gray900 }}
        >
          Team
        </h1>
        <p className="text-sm mt-0.5" style={{ color: colors.gray500 }}>
          {MEMBERS.length} members · Acme Corp
        </p>
      </div>
      <WpButton size="sm" leftIcon={<UserPlus size={15} />}>
        <span className="hidden sm:inline">Invite Member</span>
        <span className="sm:hidden">Invite</span>
      </WpButton>
    </div>

    {/* Member grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-shrink-0">
      {MEMBERS.map((m) => (
        <MemberCard key={m.id} member={m} />
      ))}
    </div>

    {/* RBAC */}
    <div className="flex-shrink-0">
      <h2
        className="text-base font-bold mb-4"
        style={{ color: colors.gray900 }}
      >
        Role-Based Access Control
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ROLES.map((r) => (
          <RoleCardView key={r.name} role={r} />
        ))}
      </div>
    </div>
  </div>
);
