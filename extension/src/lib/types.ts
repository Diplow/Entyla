export interface LinkedInProfileData {
  providerId: string;
  firstName: string;
  lastName: string;
  headline: string | null;
  linkedinUrl: string;
  currentJobTitle: string | null;
}

export interface LinkedInCompanyData {
  providerId: string | null;
  name: string;
  industry: string | null;
  size: string | null;
  website: string | null;
  linkedinUrl: string | null;
}

export interface ApiMessage {
  type: "api-request";
  method: "GET" | "POST";
  path: string;
  body?: unknown;
}

export interface ApiResponse {
  ok: boolean;
  status: number;
  data: unknown;
}
