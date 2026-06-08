import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";

export interface RouteItem  {
    name: string;
    link: string;
    icon?: LucideIcon;
    component?: ComponentType<any>;
    children?: RouteItem[]
};

export interface Header {
  name: string,
  className?: string,
  colSpan?: number
  textAlign?: "center" | "left" | "end"
}

export interface DRFResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PaginationData {
    count? :number,
    prev?: string,
    next?: string
}

export interface ReportClient {
  id: number;
  registered_name: string;
  trading_name: string;
  address_registered: string;
  email: string;
}

export interface ReportSubject {
  id: number;
  full_name: string;
  national_id: string;
  residential_address: string;
  mobile_number: string;
  email: string;
}

export interface Report {
  id: number;
  enquiry_reference: string;
  client: ReportClient;
  subject: ReportSubject;
  created_at: string;
  updated_at: string;
}