import clsx from "clsx";
import { useState } from "react";
import { Link } from "react-router";
import Select from "react-select";

export const FormLabel = ({ children, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    className="mb-1 block text-left text-sm text-gray-700"
  >
    {children}
  </label>
);

// Common style constants for consistency
const commonInputStyles = {
  base: clsx(
    "w-full px-4 py-3 border rounded-lg text-gray-900 text-base",
    "focus:outline-none focus:border-[var(--color-primary)]",
    "transition-colors duration-200",
  ),
  error: "border-red-500",
  normal: "border-gray-300",
  disabled: "bg-gray-100 cursor-not-allowed text-gray-700",
};

const commonControlStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    padding: "0.5rem",
    minHeight: "42px",
    textAlign: "left",
    borderRadius: "0.5rem",
    backgroundColor: state.isDisabled
      ? "var(--color-gray-100)"
      : "var(--color-white)",
    cursor: state.isDisabled ? "not-allowed" : "default",
    borderColor: state.selectProps.error
      ? "var(--danger)"
      : state.isFocused
        ? "var(--color-primary)"
        : "var(--color-gray-300)",
    boxShadow: "none",
    "&:hover": {
      borderColor: "var(--color-primary)",
    },
  }),
  option: (baseStyles, state) => ({
    ...baseStyles,
    backgroundColor: state.isSelected
      ? "rgba(79, 57, 246, 0.1)"
      : state.isFocused
        ? "rgba(79, 57, 246, 0.05)"
        : "var(--color-white)",
    color: "var(--color-gray-900)",
    textAlign: "left",
    fontWeight: state.isSelected ? "500" : "400",
    padding: "0.5rem 1rem",
    "&:hover": {
      backgroundColor: "rgba(79, 57, 246, 0.05)",
    },
  }),
  multiValue: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: "rgba(79, 57, 246, 0.1)",
    borderRadius: "var(--rounded)",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  }),
  multiValueLabel: (baseStyles) => ({
    ...baseStyles,
    color: "var(--color-primary)",
    fontWeight: "500",
  }),
  multiValueRemove: (baseStyles) => ({
    ...baseStyles,
    color: "var(--color-primary)",
    "&:hover": {
      backgroundColor: "rgba(79, 57, 246, 0.1)",
      color: "var(--color-primary)",
    },
  }),
};

export const FormInput = ({ error, touched, disabled, ...props }) => (
  <input
    {...props}
    disabled={disabled}
    className={clsx(
      commonInputStyles.base,
      { [commonInputStyles.error]: touched && error },
      { [commonInputStyles.normal]: !(touched && error) },
      { [commonInputStyles.disabled]: disabled },
    )}
  />
);
export const FormTextarea = ({
  error,
  touched,
  disabled,
  rows = 3,
  ...props
}) => (
  <textarea
    {...props}
    rows={rows}
    disabled={disabled}
    className={clsx(
      commonInputStyles.base,
      { [commonInputStyles.error]: touched && error },
      { [commonInputStyles.normal]: !(touched && error) },
      { [commonInputStyles.disabled]: disabled },
    )}
  />
);
export const FormError = ({ children }) =>
  children ? (
    <p className="mt-0 text-left text-sm text-red-600">{children}</p>
  ) : null;

export const PrimaryButton = ({ children, loading, className, ...props }) => {
  return (
    <button
      {...props}
      className={clsx(
        "flex w-full cursor-pointer justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white",
        "bg-[var(--color-primary)]",
        // 'hover:bg-[var(--color-primary-dark)] hover:shadow-md',
        "focus:border-[var(--color-primary-dark)] focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none",
        "transition-all duration-200 ease-in-out",
        className,
      )}
    >
      {children}
    </button>
  );
};

export const FormSelect = ({
  options,
  error,
  touched,
  disabled,
  valueKey = "optionValue",
  labelKey = "optionLabel",
  ...props
}) => (
  <select
    {...props}
    disabled={disabled}
    className={clsx(
      commonInputStyles.base,
      { [commonInputStyles.error]: touched && error },
      { [commonInputStyles.normal]: !(touched && error) },
      { [commonInputStyles.disabled]: disabled },
    )}
  >
    {options.map((option) => (
      <option key={option[valueKey]} value={option[valueKey]}>
        {option[labelKey]}
      </option>
    ))}
  </select>
);

export const SecondaryButton = ({ children, ...props }) => (
  <button
    {...props}
    type="button"
    className={clsx(
      "flex w-full cursor-pointer justify-center rounded-md border border-gray-300 px-4 py-2",
      "bg-white text-sm font-medium text-gray-700",
      // 'hover:bg-gray-50 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:shadow-md',
      "focus:border-[var(--color-primary)] focus:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none",
      "transition-all duration-200 ease-in-out",
    )}
  >
    {children}
  </button>
);

export const TimePicker = ({ error, touched, disabled, ...props }) => (
  <input
    {...props}
    type="time"
    disabled={disabled}
    className={clsx(
      commonInputStyles.base,
      { [commonInputStyles.error]: touched && error },
      { [commonInputStyles.normal]: !(touched && error) },
      { [commonInputStyles.disabled]: disabled },
    )}
  />
);

export const Checkbox = ({ label, disabled, ...props }) => (
  <div className={clsx("flex items-center", { "opacity-60": disabled })}>
    <input
      type="checkbox"
      disabled={disabled}
      {...props}
      className={clsx(
        "mr-2 h-4 w-4 rounded-md border-gray-300",
        "text-[var(--color-primary)]",
        "focus:border-[var(--color-primary)] focus:outline-none",
        { "cursor-not-allowed bg-gray-100": disabled },
      )}
    />
    <label htmlFor={props.id} className={clsx({ "text-gray-700": disabled })}>
      {label}
    </label>
  </div>
);

export const FileUpload = ({ error, touched, disabled, ...props }) => (
  <input
    {...props}
    type="file"
    disabled={disabled}
    className={clsx(
      commonInputStyles.base,
      "border-2 border-dashed file:mr-4 file:border-0 file:px-4 file:py-2",
      "file:bg-[var(--color-primary-light)] file:text-sm file:font-medium file:text-[var(--color-primary)]",
      "hover:border-[var(--color-primary)] focus:border-[var(--color-primary)]",
      "transition-colors duration-200",
      { [commonInputStyles.error]: touched && error },
      { [commonInputStyles.normal]: !(touched && error) },
      { [commonInputStyles.disabled]: disabled },
    )}
  />
);
export const MultiSelect = ({
  options,
  formik,
  name,
  isMultiple = true,
  disabled,
  ...props
}) => {
  const isMulti = isMultiple;
  // const formikValue = formik.values[name];
  const formikValue = formik?.values?.[name] ?? (isMultiple ? [] : "");
  const selectedValue = isMulti
    ? options.filter((option) => formikValue?.includes(option.value))
    : options.find((option) => option.value === formikValue);

  return (
    <Select
      {...props}
      id={name}
      name={name}
      isMulti={isMulti}
      isDisabled={disabled}
      options={options}
      value={selectedValue}
      onChange={(selected) => {
        if (isMulti) {
          formik.setFieldValue(
            name,
            selected ? selected.map((opt) => opt.value) : [],
          );
        } else {
          formik.setFieldValue(name, selected ? selected.value : "");
        }
      }}
      onBlur={() => formik.setFieldTouched(name, true)}
      className="w-full"
      classNamePrefix="select"
      styles={commonControlStyles}
    />
  );
};

export const MultiSelectWithoutFormik = ({
  options,
  name,
  value,
  ...props
}) => {
  return (
    <Select
      {...props}
      id={name}
      name={name}
      isMulti
      options={options}
      className={clsx("w-full")}
      // value={ value ? options.filter(option => value.includes(option.value)) : []}
      // onChange={(selectedOptions) => {
      //   setValue(selectedOptions.map(option => option.value));
      // }}
      classNamePrefix="select"
      formatOptionLabel={({ label, profileImage }) => (
        <div className="flex items-center gap-2">
          {profileImage && (
            <img
              src={profileImage}
              alt={label}
              className="h-6 w-6 rounded-full object-cover"
            />
          )}
          <span>{label}</span>
        </div>
      )}
      styles={{
        control: (baseStyles, state) => ({
          ...baseStyles,
          padding: "0.5rem",
          textAlign: "left",
          borderRadius: "0.5rem",
          borderColor: "#e5e7eb",
          boxShadow: state.isFocused
            ? "0 0 0 2px rgba(37, 99, 235, 0.2)"
            : "none",
          "&:hover": {
            borderColor: state.isFocused ? "#2563eb" : "#e5e7eb",
          },
        }),
        option: (baseStyles, state) => ({
          ...baseStyles,
          backgroundColor: state.isSelected
            ? "rgba(37, 99, 235, 0.1)"
            : state.isFocused
              ? "rgba(37, 99, 235, 0.05)"
              : "white",
          color: "#111827",
          textAlign: "left",
          fontWeight: state.isSelected ? "500" : "400",
          padding: "0.5rem 1rem",
          "&:hover": {
            backgroundColor: "rgba(37, 99, 235, 0.05)",
          },
        }),
        multiValue: (baseStyles) => ({
          ...baseStyles,
          backgroundColor: "rgba(37, 99, 235, 0.1)",
          borderRadius: "0.375rem",
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
        }),
        multiValueLabel: (baseStyles) => ({
          ...baseStyles,
          color: "#2563eb",
          fontWeight: "500",
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
        }),
        multiValueRemove: (baseStyles) => ({
          ...baseStyles,
          color: "#2563eb",
          "&:hover": {
            backgroundColor: "rgba(37, 99, 235, 0.2)",
            color: "#2563eb",
          },
        }),
      }}
    />
  );
};
const customStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensures dropdown is above all layers
  menu: (base) => ({ ...base, zIndex: 9999 }), // Extra safety
};

export const FormSelectCustomised = ({
  options,
  error,
  touched,
  disabled,
  fullWidth = true,
  ...props
}) => (
  <Select
    {...props}
    isDisabled={disabled}
    options={options}
    className={fullWidth ? "w-full" : "w-[300px]"}
    styles={{
      ...commonControlStyles,
      menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensures dropdown is above all layers
      menu: (base) => ({ ...base, zIndex: 9999 }), // Extra safety
    }}
    menuPortalTarget={document.body}
  />
);
