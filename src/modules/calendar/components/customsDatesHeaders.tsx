interface Props {
  label: string;
  date: Date;
  selectedDate: Date | null;
}

const CustomDateHeader = ({ label, date, selectedDate }: Props) => {
  const isToday = new Date().toDateString() === date.toDateString();

  const isSelected = selectedDate?.toDateString() === date.toDateString();

  return (
    <div className="flex justify-center pt-1">
      <div
        className={`flex h-6 w-6 sm:h-9 sm:w-9 items-center justify-center rounded-full text-[11px] sm:text-sm font-semibold transition-all ${isSelected
          ? 'border-2 border-blue-600 text-blue-600'
          : isToday
            ? 'bg-blue-600 text-white'
            : 'text-gray-700'
          }`}
      >
        {label}
      </div>
    </div>
  );
};

export default CustomDateHeader;
