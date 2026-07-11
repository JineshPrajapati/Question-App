type Option = {
  label: string;
  value: number;
};

type Props = {
  label: string;
  options: Option[];
  value: number[];
  onChange: (values: number[]) => void;
  disabled?: boolean;
};

export default function MultiSelect({
  label,
  options,
  value,
  onChange,
  disabled,
}: Props) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <select
        multiple
        value={value.map(String)}
        onChange={(e) =>
          onChange(Array.from(e.target.selectedOptions, (o) => Number(o.value)))
        }
        disabled={disabled}
        className="w-full border p-2 h-28"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
