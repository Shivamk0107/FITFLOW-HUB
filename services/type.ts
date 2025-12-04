export interface UserProfile {
  id?: string;
  username: string;
  email: string;
  password?: string;
  token?: string;
  photo?: string;
  gender?: string;
  height?: string;
  weight?: string;
  age?: number;
  fitnessLevel?: "Beginner" | "Intermediate" | "Advanced";
}