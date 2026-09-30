// Core type definitions for Hire-Alert

export type OpportunityType =
  | "JOB"
  | "INTERNSHIP"
  | "HACKATHON"
  | "SCHOLARSHIP"
  | "COMPETITION"
  | "EVENT"
  | "OPEN_SOURCE"
  | "FREELANCING";

export type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "INTERVIEW"
  | "ASSESSMENT"
  | "OFFER"
  | "REJECTED"
  | "NOT_INTERESTED"
  | "ARCHIVED";

export type ExperienceLevel =
  | "FRESHER"
  | "JUNIOR"
  | "MID"
  | "SENIOR"
  | "ANY";

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface Profile {
  id: string;
  userId: string;
  college?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  cgpa?: number;
  skills: string[];
  preferredRoles: string[];
  preferredLocations: string[];
  preferredCompanies: string[];
  interests: string[];
  projects: Project[];
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  technologies: string[];
  link?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  description?: string;
  shortDescription?: string;
  type: OpportunityType;
  location?: string;
  locationType: string;
  salary?: string;
  stipend?: string;
  currency: string;
  experienceLevel: ExperienceLevel;
  deadline?: string;
  postedDate?: string;
  url?: string;
  source: string;
  skills: string[];
  eligibility?: string;
  responsibilities: string[];
  isActive: boolean;
  fitScore?: number;
  fitExplanation?: string;
  matchedSkills: string[];
  missingSkills: string[];
  applicationStatus?: ApplicationStatus | null;
}

export interface Application {
  id: string;
  userId: string;
  opportunityId: string;
  status: ApplicationStatus;
  fitScore?: number;
  fitExplanation?: string;
  matchedSkills: string[];
  missingSkills: string[];
  notes?: string;
  opportunity: Opportunity;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  saved: number;
  applied: number;
  interviews: number;
  offers: number;
  deadlines: number;
  weeklyViews: number;
  weeklyApplications: number;
  averageFitScore: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message?: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: string;
}
