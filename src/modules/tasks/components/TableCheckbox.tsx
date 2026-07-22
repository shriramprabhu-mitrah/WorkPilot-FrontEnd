import { WpCheckbox } from "@/src/app/components/common/checkbox";

type TableCheckboxProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
};

export const TableCheckbox = ({ checked, onChange }: TableCheckboxProps) => {
    return <WpCheckbox checked={checked} onChange={(e) => onChange(e.target.checked)} />;
};