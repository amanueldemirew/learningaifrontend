export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
  profile_photo?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  password?: string;
  profile_photo?: string;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
}

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
  profile_photo?: string;
  created_at?: string;
  updated_at?: string;
}
