import { colors } from '@/src/styles/colors';

const legends = [
  {
    label: 'Sprint',
    color: colors.colInReview,
  },
];

const EventLegends = () => {
  return (
    <div className="mt-3 flex flex-wrap gap-5">
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
