import type { ComponentProps } from "react";

type DateInputProps = Omit<ComponentProps<"input">, "type">;

// Keep spacing on the wrapper: iOS date controls can miscalculate width when padded.
export function DateInput({ className = "", ...props }: DateInputProps) {
  return (
    <div className="date-control">
      <input {...props} type="date" className={`date-input ${className}`} />
    </div>
  );
}
