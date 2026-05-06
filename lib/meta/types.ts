export interface UserData {
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
  ct?: string;
  st?: string;
  zp?: string;
  country?: string;
  client_ip_address?: string;
  client_user_agent?: string;
  fbc?: string;
  fbp?: string;
}

export interface CustomData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  num_items?: number;
  predicted_ltv?: number;
  status?: string;
  productKey?: string;
  [key: string]: string | number | string[] | undefined;
}

export interface ServerEvent {
  event_name: string;
  event_time: number;
  event_id?: string;
  event_source_url: string;
  action_source:
    | "website"
    | "email"
    | "app"
    | "phone_call"
    | "physical_store"
    | "system_generated"
    | "other";
  user_data: UserData;
  custom_data?: CustomData;
  opt_out?: boolean;
}

export interface ConversionsAPIResponse {
  events_received?: number;
  messages?: string[];
  fbtrace_id?: string;
}

export type MetaEventName =
  | "Purchase"
  | "Lead"
  | "CompleteRegistration"
  | "AddToCart"
  | "InitiateCheckout"
  | "ViewContent"
  | "Subscribe"
  | "StartTrial"
  | "SubmitApplication"
  | "Contact"
  | "Download";
