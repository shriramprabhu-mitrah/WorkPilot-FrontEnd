import { colors } from '@/src/styles/colors';

const legends = [
  {
    label: 'Sprint',
    color: colors.colInReview,
  },
  {
    label: 'Meeting',
    color: colors.priorityHighText,
  },
  {
    label: 'Task',
    color: colors.colTodo,
  },
];

const EventLegends = () => {
  return (
    <div className="mt-6 flex flex-wrap gap-6">
      {legends.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />

          <span className="text-sm text-gray-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default EventLegends;
