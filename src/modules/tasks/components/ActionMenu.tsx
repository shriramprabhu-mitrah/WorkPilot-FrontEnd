'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';

type ActionMenuProps = {
  onView: () => void;
  onUpdate: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canDelete: boolean;
};

export const ActionMenu = ({ onView, onUpdate, onDelete, canEdit, canDelete }: ActionMenuProps) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <WpButton variant="ghost" size="sm" className="!p-2" onClick={() => setOpen(!open)}>
        <MoreHorizontal size={18} />
      </WpButton>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg">
          <WpButton
            variant="ghost"
            size="sm"
            fullWidth
            onClick={onView}
            leftIcon={<Eye size={16} />}
            className="justify-start rounded-none"
          >
            View
          </WpButton>

          {canEdit && (
            <WpButton
              variant="ghost"
              size="sm"
              fullWidth
              onClick={onUpdate}
              leftIcon={<Pencil size={16} />}
              className="justify-start rounded-none"
            >
              Update
            </WpButton>
          )}

          {canDelete && (
            <WpButton
              variant="ghost"
              size="sm"
              fullWidth
              onClick={onDelete}
              leftIcon={<Trash2 size={16} />}
              className="justify-start rounded-none text-red-600 hover:bg-red-50"
            >
              Delete
            </WpButton>
          )}
        </div>
      )}
    </div>
  );
};
