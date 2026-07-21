"use client";

import { Fragment, useMemo, useState } from "react";
import { permissionsData } from "../data/matrixJson";
import { Check, X, TriangleAlert, Search, } from "lucide-react";
type PermissionStatus = "allowed" | "not_allowed" | "conditional";

export type Permission = {
    name: string;
    category: string;
    superAdmin: PermissionStatus;
    orgAdmin: PermissionStatus;
    pm: PermissionStatus;
    developer: PermissionStatus;
    viewer: PermissionStatus;
};

const categories = [
    "All",
    "Organization",
    "Projects",
    "Sprints",
    "Tasks",
    "Reports",
];

export const roleHeaders = [
    { key: "superAdmin", label: "Super Admin" },
    { key: "orgAdmin", label: "Org Admin" },
    { key: "pm", label: "PM" },
    { key: "developer", label: "Developer" },
    { key: "viewer", label: "Viewer" },
] as const;

function PermissionStatusIcon({
    status,
}: {
    status: PermissionStatus;
}) {
    if (status === "allowed") {
        return (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-green-500">
                <Check
                    size={14}
                    strokeWidth={2.5}
                    className="text-green-500"
                />
            </span>
        );
    }
    if (status === "conditional") {
        return (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <TriangleAlert
                    size={14}
                    strokeWidth={2.5}
                    className="text-orange-500"
                />
            </span>
        );
    }
    return (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-400">
            <X
                size={14}
                strokeWidth={2.5}
                className="text-red-400"
            />
        </span>
    );
}

export default function PermissionsMatrix() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const filteredPermissions = useMemo(() => {
        return permissionsData.filter((permission) => {
            const matchesSearch = permission.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

            const matchesCategory =
                selectedCategory === "All" ||
                permission.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, selectedCategory]);

    return (
        <div className="w-full">
            <div className="mb-5 flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search permissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-9 w-52 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-gray-400 focus:border-blue-500"
                    />

                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Search
                            size={16}
                        />
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    {categories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            onClick={() => setSelectedCategory(category)}
                            className={`rounded-lg px-4 py-2 text-xs font-medium transition ${selectedCategory === category
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Permission Table */}
            <div className="w-250 overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="w-[40%] px-4 py-4 text-left text-xs font-medium text-gray-600">
                                    Permission
                                </th>

                                <th className="w-[12%] px-4 py-4 text-center text-xs font-medium text-purple-600">
                                    Super Admin
                                </th>

                                <th className="w-[12%] px-4 py-4 text-center text-xs font-medium text-blue-600">
                                    Org Admin
                                </th>

                                <th className="w-[12%] px-4 py-4 text-center text-xs font-medium text-orange-500">
                                    PM
                                </th>

                                <th className="w-[12%] px-4 py-4 text-center text-xs font-medium text-green-600">
                                    Developer
                                </th>

                                <th className="w-[12%] px-4 py-4 text-center text-xs font-medium text-gray-500">
                                    Viewer
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredPermissions.map((permission, index) => {
                                const isFirstCategory =
                                    index === 0 ||
                                    filteredPermissions[index - 1].category !==
                                    permission.category;

                                return (
                                    <Fragment key={permission.name}>
                                        {isFirstCategory && (
                                            <tr className="bg-gray-50">
                                                <td
                                                    colSpan={6}
                                                    className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400"
                                                >
                                                    {permission.category}
                                                </td>
                                            </tr>
                                        )}

                                        <tr className="border-b border-gray-100 last:border-0">
                                            <td className="w-[40%] px-4 py-4 text-left text-sm text-gray-700">
                                                {permission.name}
                                            </td>

                                            <td className="w-[12%] px-4 py-4 text-center align-middle">
                                                <div className="flex items-center justify-center">
                                                    <PermissionStatusIcon
                                                        status={permission.superAdmin}
                                                    />
                                                </div>
                                            </td>

                                            <td className="w-[12%] px-4 py-4 text-center align-middle">
                                                <div className="flex items-center justify-center">
                                                    <PermissionStatusIcon
                                                        status={permission.orgAdmin}
                                                    />
                                                </div>
                                            </td>

                                            <td className="w-[12%] px-4 py-4 text-center align-middle">
                                                <div className="flex items-center justify-center">
                                                    <PermissionStatusIcon
                                                        status={permission.pm}
                                                    />
                                                </div>
                                            </td>

                                            <td className="w-[12%] px-4 py-4 text-center align-middle">
                                                <div className="flex items-center justify-center">
                                                    <PermissionStatusIcon
                                                        status={permission.developer}
                                                    />
                                                </div>
                                            </td>

                                            <td className="w-[12%] px-4 py-4 text-center align-middle">
                                                <div className="flex items-center justify-center">
                                                    <PermissionStatusIcon
                                                        status={permission.viewer}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center gap-5 border-t border-gray-200 px-4 py-3 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <PermissionStatusIcon status="allowed" />
                        <span>Allowed</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <PermissionStatusIcon status="not_allowed" />
                        <span>Not allowed</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <PermissionStatusIcon status="conditional" />
                        <span>Conditional</span>
                    </div>
                </div>
            </div>
        </div>
    );
}