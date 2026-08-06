import { LayoutGrid, List } from 'lucide-react';
import { WpButton } from '@/src/app/components/common/button';

export type ViewType = 'grid' | 'list';

interface Props {
  view: ViewType;
  onChange: (view: ViewType) => void;
}

export const ViewToggle = ({ view, onChange }: Props) => {
  return (
    <div className="flex items-center rounded-lg border border-gray-200 bg-white shadow-sm">
      <WpButton
        variant="ghost"
        size="sm"
        className={`!p-2 ${
          view === 'grid' ? '!bg-blue-600 !text-white' : '!text-gray-500 hover:!bg-gray-100'
        }`}
        onClick={() => onChange('grid')}
      >
        <LayoutGrid size={18} />
      </WpButton>
      <WpButton
        variant="ghost"
        size="sm"
        className={`!p-2 ${
          view === 'list' ? '!bg-blue-600 !text-white' : '!text-gray-500 hover:!bg-gray-100'
        }`}
        onClick={() => onChange('list')}
      >
        <List size={18} />
      </WpButton>
    </div>
  );
};
