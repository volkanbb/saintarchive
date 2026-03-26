export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}
