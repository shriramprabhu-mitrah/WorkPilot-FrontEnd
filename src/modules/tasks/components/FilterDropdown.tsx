"use client";

import { ChevronDown } from "lucide-react";

type FilterDropdownProps = {
    value: string;
    options: string[];
    onChange: (value: string) => void;
};

export const FilterDropdown = ({
    value,
    options,
    onChange,
}: FilterDropdownProps) => {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 rounded-md border border-gray-200 bg-white px-3 text-xs"
        >
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
};