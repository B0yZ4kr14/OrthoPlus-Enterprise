// cspell:disable
export interface AuthConfig {
  email_password_enabled?: boolean;
  google_oauth_enabled?: boolean;
  google_client_id?: string;
  google_client_secret?: string;
  auto_confirm_email?: boolean;
  password_min_length?: number;
  require_uppercase?: boolean;
  require_number?: boolean;
  require_special_char?: boolean;
}
