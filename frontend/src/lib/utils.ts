import { FILE_STYLES } from "@/constants";
import type { Address, Company, EntityValue, Individual, MiniCompany, MiniIndividual } from "@/types/core";
import { isAxiosError, type AxiosError } from "axios";
import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrentDateFormatted() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear().toString().slice(-2);
  return `${day}-${month.toUpperCase()}-${year}`;
}

export function getFormattedDate(dateStr: string){
   const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date string");
  }

  const months = [
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec",
  ];

  const day = String(date.getDate()).padStart(2, "0");
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day}-${month.toLocaleUpperCase()}-${year}`;
}

export const toCap = (value: string): string => {
  const normalized = value.replaceAll(/_/g, " ");
  if (!normalized) return normalized;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const handleAxiosError = (
  error: Error | AxiosError | unknown,
  title = "An error occurred."
) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as {
      error?: string;
      detail?: string;
      message?: string;
    };

    const message =
      data?.error ??
      data?.detail ??
      data?.message ??
      error.message ??
      "Something went wrong";

    toast.error(title, {
      description: message,
    });

    console.log(error)
    return true;
  }
  return false
};

export const formatAddressToString = (address: Address | undefined): string => {
  if (!address) return "-, -, -, -, -, -"
  return [
    address.street_address,
    address.line_2,
    address.country,
    address.province,
    address.city,
    address.postal_code,
  ]
    .map(value => (value?.trim() ? value : "-"))
    .join(", ");
};

export const formatAddressToObject = (addressString: string): Address => {
  const [
    street_address,
    line_2,
    country,
    province,
    city,
    postal_code,
  ] = addressString.split(",").map(part => part.trim());

  return {
    street_address: street_address === "-" ? "" : street_address,
    line_2: line_2 === "-" ? "" : line_2,
    country: country === "-" ? "" : country,
    province: province === "-" ? "" : province,
    city: city === "-" ? "" : city,
    postal_code: postal_code === "-" ? "" : postal_code,
  };
};
export function cleanPayload<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data)
      .map(([key, value]) => {
          if (Array.isArray(value)) {
              const cleaned = value
                  .map(item => typeof item === "object" && item !== null ? cleanPayload(item as Record<string, unknown>) : item)
                  .filter(item => item !== "" && item !== undefined)
              return [key, cleaned.length ? cleaned : undefined]
          }

          if (typeof value === "object" && value !== null) {
              const cleaned = cleanPayload(value as Record<string, unknown>)
              return [key, Object.keys(cleaned).length ? cleaned : undefined]
          }

          return [key, value === "" || value === undefined ? undefined : value]
      })
      .filter(([, value]) => value !== undefined)
  ) as Partial<T>
}

export const handleTrackChangedFields = (initial: any, payloadData: any, toastInfo = false): any => {
  const deepDiff = (obj1: any, obj2: any): any => {
    return Object.entries(obj2).reduce((acc, [key, value]) => {
      const original = obj1?.[key];

      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        const nestedDiff = deepDiff(original ?? {}, value);
        if (Object.keys(nestedDiff).length > 0) acc[key] = nestedDiff;
      } else if (Array.isArray(value)) {
        if (JSON.stringify(value) !== JSON.stringify(original)) acc[key] = value;
      } else if (typeof value === "string" && typeof original === "string") {
        if (value.trim() !== original.trim()) acc[key] = value;
      } else if (value !== original) {
        acc[key] = value;
      }

      return acc;
    }, {} as any);
  };

  const changedData = deepDiff(initial, payloadData);

  const isDeepEmpty = (obj: any): boolean =>
    Object.keys(obj).length === 0 ||
    Object.values(obj).every(v => v !== null && typeof v === "object" && !Array.isArray(v) && isDeepEmpty(v));

  if (isDeepEmpty(changedData)) {
    if (toastInfo) toast.info("No changes made.");
    return undefined;
  }

  return changedData;
};

export const handleTrackChangedArray = (initial: any[], current: any[]): any[] => {
  const hasChanges = (obj1: any, obj2: any): boolean => {
    return Object.entries(obj2).some(([key, value]) => {
      const original = obj1?.[key];

      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        return hasChanges(original ?? {}, value);
      } else if (Array.isArray(value)) {
        return JSON.stringify(value) !== JSON.stringify(original);
      } else if (typeof value === "string" && typeof original === "string") {
        return value.trim() !== original.trim();
      } else {
        return value !== original;
      }
    });
  };

  return current.reduce((acc, item) => {
    if (item.id) {
      // existing row — return whole object if anything changed
      const original = initial.find(i => i.id === item.id);
      if (!original || hasChanges(original, item)) {
        acc.push(item);
      }
    } else {
      // new row — take it as-is
      acc.push(item);
    }
    return acc;
  }, [] as any[]);
};

export const getEntityName =(item :Company | Individual | MiniCompany | MiniIndividual) =>{
  return "national_id" in item
  ? item.full_name
  : item.registered_name
}

export const getEntityID = (item :Company | Individual | MiniCompany | MiniIndividual) =>{
  return "national_id" in item
  ? item.national_id ?? "-"
  : item.registration_number ?? "-"
}

export function getFileKind(url?: string): keyof typeof FILE_STYLES {
  if (!url) return "other";
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext ?? "")) return "image";
  return "other";
}

export function genStorageKey(report_id:number | undefined, subject_type:EntityValue | null | undefined,  section :string){
  return `report_${subject_type}_${report_id}_${section}`
}