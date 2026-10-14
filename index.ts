export type WorkMode = 'remote' | 'hybrid' | 'on-site';

export type AcademicYear = '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | '5th Year' | 'Postgraduate';

export type SkillProficiency = 'Beginner' | 'Intermediate' | 'Advanced';

export interface StudentSkill {
  name: string;
  proficiency: SkillProficiency;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  degree: string;             // e.g. B.Tech, B.Sc, BCA, MCA
  branch: string;             // e.g. Computer Science, Information Technology, Data Science, Electrical
  academicYear: AcademicYear;
  skills: StudentSkill[];
  interests: string[];        // e.g. Frontend Development, Machine Learning, Cloud DevOps, UI/UX
  preferredLocations: string[]; // e.g. Bengaluru, Remote, Mumbai, Delhi NCR, Hyderabad, Pune
  workModePreference: WorkMode[]; // remote, hybrid, on-site
  preferredDuration: string;  // e.g. '1-2 months', '3-6 months', '6+ months'
  minStipendPreference: number; // e.g. 0, 10000, 20000 INR
  role: 'student' | 'admin';
  updatedAt: string;
}

export type VerificationStatus = 'verified' | 'unverified';
export type PublicationStatus = 'draft' | 'published' | 'expired' | 'archived';

export interface Internship {
  id: string;
  title: string;
  organization: string;
  description: string;
  department?: string;
  location: string;
  workMode: WorkMode;
  duration: string;           // e.g. "3 Months", "6 Months"
  stipend: number;            // 0 for unpaid, >0 for monthly stipend in INR
  stipendCurrency?: string;   // e.g. "INR", "USD"
  isUnpaid: boolean;
  applicationDeadline: string; // ISO date string YYYY-MM-DD
  originalApplicationUrl: string;
  sourceName: string;         // e.g. "Official Careers Portal", "GitHub Student Pack", "University Board"
  sourceType: 'career_portal' | 'university' | 'github_externship' | 'direct_post';
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string;     // ISO timestamp
  publicationStatus: PublicationStatus;
  isDemoData: boolean;        // Visible honest labeling
  
  // Requirements & Eligibility Criteria
  requiredSkills: string[];
  preferredSkills: string[];
  eligibleDegrees: string[];  // Empty array means open to all degrees
  eligibleBranches: string[]; // Empty array means open to all branches
  eligibleAcademicYears: AcademicYear[]; // Empty array means open to all years
  minCgpa?: number;
  
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = 
  | 'Saved'
  | 'Planning to Apply'
  | 'Applied'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn';

export interface ApplicationRecord {
  id: string;
  userId: string;
  internshipId: string;
  status: ApplicationStatus;
  applicationDate?: string;
  interviewDate?: string;
  nextAction?: string;
  notes?: string;
  updatedAt: string;
}

export type EligibilityStatus = 'eligible' | 'not_eligible' | 'unknown';

export interface MatchBreakdown {
  overallScore: number;       // 0 to 100
  skillScore: number;         // 0 to 100 (50% weight)
  courseScore: number;        // 0 to 100 (20% weight)
  locationScore: number;      // 0 to 100 (15% weight)
  interestScore: number;      // 0 to 100 (15% weight)
  
  // Detailed explainability
  eligibility: EligibilityStatus;
  eligibilityReasons: string[];
  
  matchingSkills: string[];
  missingMandatorySkills: string[];
  missingPreferredSkills: string[];
  
  matchedPreferences: string[];
  uncertainFields: string[];
  
  // Learning & preparation suggestions
  learningSuggestions: {
    skill: string;
    description: string;
    actionableTasks: string[];
  }[];
}

export interface InternshipFilterState {
  searchQuery: string;
  skills: string[];
  degree: string;
  branch: string;
  academicYear: string;
  location: string;
  workMode: string;
  roleInterest: string;
  duration: string;
  minStipend: number;
  verifiedOnly: boolean;
  hideExpired: boolean;
  sortBy: 'relevance' | 'deadline' | 'stipend_desc' | 'newest';
}
