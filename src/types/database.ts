export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  capacity: number | null;
  category_id?: string | null;
  created_at: string;
  end_time?: string | null;
  event_status?: string;
  performer_name?: string | null;
  performer_type?: string | null;
  price?: number;
  is_free?: boolean;
  booking_url?: string | null;
  // Phase 1 SEO fields
  slug: string;
  short_description?: string | null;
  long_description?: string | null;
  highlights?: string[];
  meta_title?: string | null;
  meta_description?: string | null;
  keywords?: string[];
  hero_image_url?: string | null;
  gallery_image_urls?: string[];
  poster_image_url?: string | null;
  thumbnail_image_url?: string | null;
  promo_video_url?: string | null;
  highlight_video_urls?: string[];
  doors_time?: string | null;
  duration_minutes?: number | null;
  last_entry_time?: string | null;
}

export interface EventFAQ {
  id: string;
  event_id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  mobile_number: string;
  created_at: string;
  sms_opt_in?: boolean;
  sms_delivery_failures?: number;
  last_sms_failure_reason?: string | null;
  last_successful_sms_at?: string | null;
  sms_deactivated_at?: string | null;
  sms_deactivation_reason?: string | null;
  messaging_status?: 'active' | 'suspended' | 'invalid_number' | 'opted_out';
  last_successful_delivery?: string | null;
  consecutive_failures?: number;
  total_failures_30d?: number;
  last_failure_type?: string | null;
}

export interface Booking {
  id: string;
  customer_id: string;
  event_id: string;
  seats: number | null;
  notes: string | null;
  created_at: string;
  // Join fields
  customer?: Customer;
  event?: Event;
}

export interface BookingReminder {
  id: string;
  booking_id: string;
  reminder_type: '24_hour' | '7_day' | '1_hour' | '12_hour' | 'custom';
  sent_at: string;
  message_id: string | null;
  created_at: string;
}

export interface Employee {
  employee_id: string; // UUID
  first_name: string;
  last_name: string;
  date_of_birth?: string | null; // Date
  address?: string | null;
  phone_number?: string | null;
  email_address: string;
  job_title: string;
  employment_start_date: string; // Date
  employment_end_date?: string | null; // Date
  status: string; // e.g., 'Active', 'Former', 'Prospective'
  created_at: string; // Timestamp
  updated_at: string; // Timestamp
}

export interface EmployeeFinancialDetails {
  employee_id: string; // UUID, Primary Key, Foreign Key to Employee
  ni_number?: string | null;
  bank_account_number?: string | null;
  bank_sort_code?: string | null;
  sort_code_in_words?: string | null;
  account_number_in_words?: string | null;
  bank_name?: string | null;
  payee_name?: string | null;
  branch_address?: string | null;
  created_at: string; // Timestamp
  updated_at: string; // Timestamp
}

export interface EmployeeHealthRecord {
  employee_id: string; // UUID, Primary Key, Foreign Key to Employee
  doctor_name?: string | null;
  doctor_address?: string | null;
  allergies?: string | null;
  illness_history?: string | null;
  recent_treatment?: string | null;
  has_diabetes: boolean;
  has_epilepsy: boolean;
  has_skin_condition: boolean;
  has_depressive_illness: boolean;
  has_bowel_problems: boolean;
  has_ear_problems: boolean;
  is_registered_disabled: boolean;
  disability_reg_number?: string | null;
  disability_reg_expiry_date?: string | null; // Date
  disability_details?: string | null;
  created_at: string; // Timestamp
  updated_at: string; // Timestamp
}

export interface EmployeeNote {
  note_id: string; // UUID
  employee_id: string; // UUID, Foreign Key to Employee
  note_text: string;
  created_at: string; // Timestamp
  created_by_user_id?: string | null; // UUID, Foreign Key to auth.users (optional)
}

export interface AttachmentCategory {
  category_id: string; // UUID
  category_name: string;
  created_at: string; // Timestamp
  updated_at: string; // Timestamp
}

export interface EmployeeAttachment {
  attachment_id: string; // UUID
  employee_id: string; // UUID, Foreign Key to Employee
  category_id: string; // UUID, Foreign Key to AttachmentCategory
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number; // Supabase uses bigint, but we use number for files up to ~9PB (Number.MAX_SAFE_INTEGER)
  description?: string | null;
  uploaded_at: string; // Timestamp
}

export interface EmployeeEmergencyContact {
  id: string; // UUID
  employee_id: string; // UUID, Foreign Key to Employee
  name: string;
  relationship?: string | null;
  address?: string | null;
  phone_number?: string | null;
  priority?: 'Primary' | 'Secondary' | 'Other' | null;
  created_at: string; // Timestamp
}

export interface EmployeeRightToWork {
  employee_id: string; // UUID, Primary Key, Foreign Key to Employee
  document_type: 'List A' | 'List B';
  document_details?: string | null;
  verification_date: string; // Date
  document_expiry_date?: string | null; // Date
  follow_up_date?: string | null; // Date
  verified_by_user_id?: string | null; // UUID
  photo_storage_path?: string | null;
  created_at: string; // Timestamp
  updated_at: string; // Timestamp
}

export interface EmployeeOnboardingChecklist {
  employee_id: string; // UUID, Primary Key, Foreign Key to Employee
  wheniwork_invite_sent?: boolean | null;
  wheniwork_invite_date?: string | null; // Date
  private_whatsapp_added?: boolean | null;
  private_whatsapp_date?: string | null; // Date
  team_whatsapp_added?: boolean | null;
  team_whatsapp_date?: string | null; // Date
  till_system_setup?: boolean | null;
  till_system_date?: string | null; // Date
  training_flow_setup?: boolean | null;
  training_flow_date?: string | null; // Date
  employment_agreement_drafted?: boolean | null;
  employment_agreement_date?: string | null; // Date
  employee_agreement_accepted?: boolean | null;
  employee_agreement_accepted_date?: string | null; // Timestamp
  created_at: string; // Timestamp
  updated_at: string; // Timestamp
}

export interface Message {
  id: string;
  customer_id: string;
  direction: 'inbound' | 'outbound';
  message_sid: string;
  body: string;
  status: string;
  created_at: string;
  updated_at: string;
  twilio_message_sid: string | null;
  twilio_status: string | null;
  error_code: string | null;
  error_message: string | null;
  price: number | null;
  price_unit: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  failed_at: string | null;
  from_number?: string | null;
  to_number?: string | null;
  message_type?: string | null;
  read_at?: string | null;
  segments?: number;
  cost_usd?: number;
}

export interface MessageDeliveryStatus {
  id: string;
  message_id: string;
  status: string;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  raw_webhook_data: Record<string, unknown>;
}

export interface WebhookLog {
  id: string;
  webhook_type: string;
  status: string;
  headers: Record<string, unknown> | null;
  body: string | null;
  params: Record<string, unknown> | null;
  error_message: string | null;
  error_details: Record<string, unknown> | null;
  processed_at: string;
  message_sid: string | null;
  from_number: string | null;
  to_number: string | null;
  message_body: string | null;
  customer_id: string | null;
  message_id: string | null;
}

export interface AuditLog {
  id: string;
  created_at: string;
  user_id?: string | null;
  user_email?: string | null;
  operation_type: string;
  resource_type: string;
  resource_id?: string | null;
  operation_status: 'success' | 'failure';
  ip_address?: string | null;
  user_agent?: string | null;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  error_message?: string | null;
  additional_info?: Record<string, unknown> | null;
}

export interface MessageTemplate {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string | null;
  template_type?: string | null;
  content: string;
  variables: string[] | null;
  is_default?: boolean;
  is_active: boolean;
  created_by?: string | null;
  character_count?: number;
  estimated_segments?: number;
  send_timing?: string | null;
  custom_timing_hours?: number | null;
}

export interface EventMessageTemplate {
  id: string;
  event_id: string;
  template_type: string;
  custom_content: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  created_at: string;
}

export interface CustomerCategoryStats {
  customer_id: string;
  category_id: string;
  booking_badge: number;
  total_spent: number;
  last_booking_date: string;
  created_at: string;
  updated_at: string;
}

export interface EventCategory {
  id: string;
  name: string;
  color: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at'>;
        Update: Partial<Omit<Event, 'id' | 'created_at'>>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, 'id' | 'created_at' | 'sms_opt_in' | 'sms_delivery_failures' | 'last_sms_failure_reason' | 'last_successful_sms_at' | 'sms_deactivated_at' | 'sms_deactivation_reason'>;
        Update: Partial<Omit<Customer, 'id' | 'created_at'>>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, 'id' | 'created_at'>;
        Update: Partial<Omit<Booking, 'id' | 'created_at'>>;
      };
      employees: {
        Row: Employee;
        Insert: Omit<Employee, 'employee_id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Employee, 'employee_id' | 'created_at' | 'updated_at'>>;
      };
      employee_financial_details: {
        Row: EmployeeFinancialDetails;
        Insert: Omit<EmployeeFinancialDetails, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EmployeeFinancialDetails, 'created_at' | 'updated_at'>>;
      };
      employee_health_records: {
        Row: EmployeeHealthRecord;
        Insert: Omit<EmployeeHealthRecord, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EmployeeHealthRecord, 'created_at' | 'updated_at'>>;
      };
      employee_notes: {
        Row: EmployeeNote;
        Insert: Omit<EmployeeNote, 'note_id' | 'created_at'>;
        Update: Partial<Omit<EmployeeNote, 'note_id' | 'created_at' | 'employee_id'>>;
      };
      attachment_categories: {
        Row: AttachmentCategory;
        Insert: Omit<AttachmentCategory, 'category_id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AttachmentCategory, 'category_id' | 'created_at' | 'updated_at' | 'category_name'>>;
      };
      employee_attachments: {
        Row: EmployeeAttachment;
        Insert: Omit<EmployeeAttachment, 'attachment_id' | 'uploaded_at'>;
        Update: Partial<Omit<EmployeeAttachment, 'attachment_id' | 'uploaded_at' | 'employee_id'>>;
      };
      employee_emergency_contacts: {
        Row: EmployeeEmergencyContact;
        Insert: Omit<EmployeeEmergencyContact, 'id' | 'created_at'>;
        Update: Partial<Omit<EmployeeEmergencyContact, 'id' | 'created_at' | 'employee_id'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Message, 'id' | 'created_at' | 'updated_at'>>;
      };
      message_delivery_status: {
        Row: MessageDeliveryStatus;
        Insert: Omit<MessageDeliveryStatus, 'id' | 'created_at'>;
        Update: Partial<Omit<MessageDeliveryStatus, 'id' | 'created_at'>>;
      };
      webhook_logs: {
        Row: WebhookLog;
        Insert: Omit<WebhookLog, 'id' | 'created_at'>;
        Update: Partial<Omit<WebhookLog, 'id' | 'created_at'>>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id' | 'created_at'>;
        Update: Partial<Omit<AuditLog, 'id' | 'created_at'>>;
      };
      message_templates: {
        Row: MessageTemplate;
        Insert: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at'>>;
      };
      event_message_templates: {
        Row: EventMessageTemplate;
        Insert: Omit<EventMessageTemplate, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EventMessageTemplate, 'id' | 'created_at' | 'updated_at'>>;
      };
      roles: {
        Row: Role;
        Insert: Omit<Role, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_roles: {
        Row: UserRole;
        Insert: Omit<UserRole, 'id' | 'created_at'>;
        Update: Partial<Omit<UserRole, 'id' | 'created_at'>>;
      };
      customer_category_stats: {
        Row: CustomerCategoryStats;
        Insert: Omit<CustomerCategoryStats, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CustomerCategoryStats, 'created_at' | 'updated_at'>>;
      };
      event_categories: {
        Row: EventCategory;
        Insert: Omit<EventCategory, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EventCategory, 'id' | 'created_at' | 'updated_at'>>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'created_at' | 'updated_at'>>;
      };
    };
  };
} 