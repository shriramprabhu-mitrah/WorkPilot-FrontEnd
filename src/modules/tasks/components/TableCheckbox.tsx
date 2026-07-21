type TableCheckboxProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
};

export const TableCheckbox = ({
    checked,
    onChange,
}: TableCheckboxProps) => {
    return (
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-blue-600"
        />
    );
};