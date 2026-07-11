import clsx from "clsx";

export const Loader = ({
  size = "medium",
  color = "primary",
  fullScreen = false,
  text = "Loading...",
}) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  const colorClasses = {
    primary: "text-primary",
    white: "text-white",
    gray: "text-gray-800",
  };

  const spinnerClasses = clsx(
    "animate-spin",
    sizeClasses[size],
    colorClasses[color],
  );

  const LoaderContent = () => (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg
        className={spinnerClasses}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <span className={clsx("text-sm font-medium", colorClasses[color])}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
        <LoaderContent />
      </div>
    );
  }

  return <LoaderContent />;
};

// Optional: Create a global loading state manager
export const LoaderOverlay = ({ isLoading, text }) => {
  if (!isLoading) return null;
  return <Loader fullScreen text={text} />;
};
