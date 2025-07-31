// Simple type definitions for the app
export interface Scholarship {
  _id: string;
  title: string;
  description: string;
  eligibility: string;
  amount: string;
  deadline: string;
  provider: string;
  category: string;
  targetGroup: string[];
  educationLevel: string;
  state: string;
  applicationLink: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScholarshipFilters {
  category?: string;
  educationLevel?: string;
  targetGroup?: string;
  state?: string;
  search?: string;
  deadline?: string;
}
