import type { RowData } from "@tanstack/react-table";
import type { ColumnFiltersState, PaginationState, SortingState, VisibilityState, ColumnOrderState } from "@tanstack/react-table";

export type DataTableConfig = typeof dataTableConfig;

export const dataTableConfig = {
  textOperators: [
    { label: "Contains", value: "iLike" as const },
    { label: "Does not contain", value: "notILike" as const },
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "ne" as const },
    { label: "Is empty", value: "isEmpty" as const },
    { label: "Is not empty", value: "isNotEmpty" as const },
  ],
  numericOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "ne" as const },
    { label: "Is less than", value: "lt" as const },
    { label: "Is greater than", value: "gt" as const },
    { label: "Is between", value: "isBetween" as const },
    { label: "Is empty", value: "isEmpty" as const },
    { label: "Is not empty", value: "isNotEmpty" as const },
  ],
  dateOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "ne" as const },
    { label: "Is before", value: "lt" as const },
    { label: "Is after", value: "gt" as const },
    { label: "Is between", value: "isBetween" as const },
    { label: "Is empty", value: "isEmpty" as const },
    { label: "Is not empty", value: "isNotEmpty" as const },
  ],
  selectOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "ne" as const },
    { label: "Is empty", value: "isEmpty" as const },
    { label: "Is not empty", value: "isNotEmpty" as const },
  ],
  multiSelectOperators: [
    { label: "Has any of", value: "inArray" as const },
    { label: "Has none of", value: "notInArray" as const },
    { label: "Is empty", value: "isEmpty" as const },
    { label: "Is not empty", value: "isNotEmpty" as const },
  ],
  booleanOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "ne" as const },
  ],
  filterVariants: [
    "text", "number", "range", "date", "dateRange", "boolean", "select", "multiSelect"
  ] as const,
  operators: [
    "iLike", "notILike", "eq", "ne", "inArray", "notInArray", 
    "isEmpty", "isNotEmpty", "lt", "gt", "isBetween"
  ] as const,
}; 

// URL Search Parameters Types
export interface DataTableState {
  pagination: PaginationState;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
  columnOrder: ColumnOrderState;
}

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
    placeholder?: string;
    variant?: FilterVariant;
    options?: Option[];
    range?: [number, number];
    unit?: string;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
    excludeFromForm?: boolean;
    readOnly?: boolean;
  }
}

export interface Option {
  label: string;
  value: string;
  count?: number;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface RelativeDateValue {
  type: "relative";
  amount: number;
  unit: "days" | "weeks" | "months" | "years";
  direction: "ago" | "from_now";
}

export function isRelativeDateValue(value: unknown): value is RelativeDateValue {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<RelativeDateValue>;
  return (
    candidate.type === "relative" &&
    typeof candidate.amount === "number" &&
    ["days", "weeks", "months", "years"].includes(candidate.unit ?? "") &&
    ["ago", "from_now"].includes(candidate.direction ?? "")
  );
}

export function resolveRelativeDate(value: RelativeDateValue, referenceDate: Date = new Date()): Date {
  const target = new Date(referenceDate);
  const multiplier = value.direction === "ago" ? -1 : 1;

  switch (value.unit) {
    case "days":
      target.setDate(target.getDate() + multiplier * value.amount);
      break;
    case "weeks":
      target.setDate(target.getDate() + multiplier * value.amount * 7);
      break;
    case "months":
      target.setMonth(target.getMonth() + multiplier * value.amount);
      break;
    case "years":
      target.setFullYear(target.getFullYear() + multiplier * value.amount);
      break;
    default:
      break;
  }

  return target;
}

export type FilterOperator = DataTableConfig["operators"][number];
export type FilterVariant = DataTableConfig["filterVariants"][number];

export interface ExtendedColumnFilter<TData> {
  id: Extract<keyof TData, string>;
  value: string | string[] | number | boolean | Date | RelativeDateValue;
  variant: FilterVariant;
  operator: FilterOperator;
  filterId: string;
}
