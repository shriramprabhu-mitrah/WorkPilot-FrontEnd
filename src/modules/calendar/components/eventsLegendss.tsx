const statusLegends = [
  { label: 'Active Sprint', color: '#10b981' },
  { label: 'Planned Sprint', color: '#6366f1' },
  { label: 'Completed Sprint', color: '#64748b' },
];

const EventLegends = () => {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-5 pt-2.5 border-t border-gray-100 dark:border-slate-700/60">
      <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
        Legend:
      </span>
      {statusLegends.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full shadow-xs" style={{ backgroundColor: item.color }} />
          <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default EventLegends;
