"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";

type ActionMenuProps = {
    onView?: () => void;
    onUpdate?: () => void;
    onDelete?: () => void;
};

export const ActionMenu = ({
    onView,
    onUpdate,
    onDelete,
}: ActionMenuProps) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen(!open)}
                className="rounded-md p-2 hover:bg-gray-100"
            >
                <MoreHorizontal size={18} />
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg">
                    <button
                        onClick={onView}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                    >
                        <Eye size={16} />
                        View
                    </button>

                    <button
                        onClick={onUpdate}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                    >
                        <Pencil size={16} />
                        Update
                    </button>

                    <button
                        onClick={onDelete}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};