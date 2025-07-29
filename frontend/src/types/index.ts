export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: number;
}

export interface Node {
  id: string;
  owner_id: string;
  display_name: string;
  subdomain_name: string;
  description: string;
  background_color: string;
  title_font_color: string;
  caption_font_color: string;
  accent_color: string;
  theme_color: string;
  show_share_button: boolean;
  theme: string;
  mouse_effects_enabled: boolean;
  text_shadows_enabled: boolean;
  hide_powered_by: boolean;
  page_title: string;
  domain: string;
  domain_verified: boolean;
  created_at: number;
  updated_at: number;
  collaborators?: string[];
}

export interface Link {
  id: string;
  node_id: string;
  name: string;
  display_name: string;
  link: string;
  description: string;
  icon: string;
  visible: boolean;
  enabled: boolean;
  mini: boolean;
  position: number;
  gradient_type: string;
  gradient_angle: number;
  created_at: number;
  updated_at: number;
  color_stops?: ColorStop[];
  custom_accent_color_enabled: boolean;
  custom_accent_color: string;
  custom_title_color_enabled: boolean;
  custom_title_color: string;
  custom_description_color_enabled: boolean;
  custom_description_color: string;
  mini_background_enabled: boolean;
}

export interface ColorStop {
  id: string;
  link_id: string;
  color: string;
  position: number;
  created_at: number;
}

export interface CreateNodeRequest {
  subdomain_name: string;
}

export interface UpdateNodeRequest {
  display_name?: string;
  description?: string;
  background_color?: string;
  title_font_color?: string;
  caption_font_color?: string;
  accent_color?: string;
  theme_color?: string;
  show_share_button?: boolean;
  theme?: string;
  mouse_effects_enabled?: boolean;
  text_shadows_enabled?: boolean;
  hide_powered_by?: boolean;
  subdomain_name?: string;
  page_title?: string;
}

export interface CreateLinkRequest {
  display_name: string;
  link: string;
  name?: string;
  description?: string;
  icon?: string;
  visible?: boolean;
  enabled?: boolean;
  mini?: boolean;
  gradient_type?: string;
  gradient_angle?: number;
  custom_accent_color_enabled?: boolean;
  custom_accent_color?: string;
  custom_title_color_enabled?: boolean;
  custom_title_color?: string;
  custom_description_color_enabled?: boolean;
  custom_description_color?: string;
  mini_background_enabled?: boolean;
}

export interface UpdateLinkRequest {
  display_name?: string;
  link?: string;
  description?: string;
  icon?: string;
  visible?: boolean;
  enabled?: boolean;
  mini?: boolean;
  gradient_type?: string;
  gradient_angle?: number;
  custom_accent_color_enabled?: boolean;
  custom_accent_color?: string;
  custom_title_color_enabled?: boolean;
  custom_title_color?: string;
  custom_description_color_enabled?: boolean;
  custom_description_color?: string;
  mini_background_enabled?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  url: string;
}

export interface PasswordChangeRequest {
  old_password: string;
  new_password: string;
}

export interface PasswordResetRequest {
  token: string;
  new_password: string;
}

export interface EmailRequest {
  email: string;
  url: string;
}

export interface ApiError {
  error: string;
  message?: string;
}

export interface Invitation {
  id: string;
  node_id: string;
  user_id: string;
  email: string;
  token: string;
  accepted: boolean;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface Collaborator {
  id: string;
  username: string;
  email: string;
} 