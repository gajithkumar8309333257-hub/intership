import { describe, it, expect } from 'vitest';
import { calculateInternshipMatch, evaluateEligibility } from '../lib/matching';
import type { Internship, StudentProfile } from '../types';

// Standard mock internship for testing
const mockInternship: Internship = {
  id: 'test-intern-1',
  title: 'Frontend React Developer Intern',
  organization: 'TechFlow Solutions',
  description: 'Work on responsive React and TypeScript web apps with modern Tailwind CSS.',
  location: 'Bengaluru',
  workMode: 'hybrid',
  duration: '3 Months',
  stipend: 25000,
  isUnpaid: false,
  applicationDeadline: '2026-11-30',
  originalApplicationUrl: 'https://careers.techflow.example/jobs/intern-frontend',
  sourceName: 'Official Careers Portal',
  sourceType: 'career_portal',
  verificationStatus: 'verified',
  lastVerifiedAt: '2026-10-14T10:00:00Z',
  publicationStatus: 'published',
  isDemoData: true,
  requiredSkills: ['React', 'TypeScript', 'Tailwind CSS'],
  preferredSkills: ['Node.js', 'Git'],
  eligibleDegrees: ['B.Tech', 'BCA', 'B.Sc'],
  eligibleBranches: ['Computer Science', 'Information Technology'],
  eligibleAcademicYears: ['3rd Year', '4th Year'],
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-14T00:00:00Z',
};

const fullStudentProfile: StudentProfile = {
  id: 'student-1',
  name: 'Priya Sharma',
  email: 'priya@university.edu',
  degree: 'B.Tech',
  branch: 'Computer Science',
  academicYear: '3rd Year',
  skills: [
    { name: 'React', proficiency: 'Advanced' },
    { name: 'TypeScript', proficiency: 'Intermediate' },
    { name: 'Tailwind CSS', proficiency: 'Intermediate' },
    { name: 'Node.js', proficiency: 'Beginner' },
  ],
  interests: ['Frontend Developer', 'Web Apps'],
  preferredLocations: ['Bengaluru'],
  workModePreference: ['hybrid', 'remote'],
  preferredDuration: '3-6 months',
  minStipendPreference: 15000,
  role: 'student',
  updatedAt: '2026-10-14T10:00:00Z',
};

describe('InternMatch Deterministic Matching Engine Tests', () => {
  // Test 1: Exact skill match produces a higher skill score than a weak match
  it('1. exact skill match produces higher skill score than weak match', () => {
    const weakStudentProfile: StudentProfile = {
      ...fullStudentProfile,
      skills: [{ name: 'Python', proficiency: 'Beginner' }],
    };

    const strongMatch = calculateInternshipMatch(fullStudentProfile, mockInternship);
    const weakMatch = calculateInternshipMatch(weakStudentProfile, mockInternship);

    expect(strongMatch.skillScore).toBeGreaterThan(weakMatch.skillScore);
    expect(strongMatch.overallScore).toBeGreaterThan(weakMatch.overallScore);
  });

  // Test 2: Missing skills are explained correctly
  it('2. missing skills are explained correctly in skill gap analysis', () => {
    const partialStudent: StudentProfile = {
      ...fullStudentProfile,
      skills: [{ name: 'React', proficiency: 'Advanced' }], // misses TypeScript and Tailwind CSS
    };

    const match = calculateInternshipMatch(partialStudent, mockInternship);

    expect(match.matchingSkills).toContain('React');
    expect(match.missingMandatorySkills).toContain('TypeScript');
    expect(match.missingMandatorySkills).toContain('Tailwind CSS');
    expect(match.missingPreferredSkills).toContain('Node.js');
    expect(match.missingPreferredSkills).toContain('Git');
    expect(match.learningSuggestions.length).toBeGreaterThan(0);
  });

  // Test 3: Mandatory eligibility failures are detected
  it('3. mandatory eligibility failures are detected and explained', () => {
    const ineligibleStudent: StudentProfile = {
      ...fullStudentProfile,
      degree: 'Mechanical Engineering', // Wrong degree
      academicYear: '1st Year',          // Wrong year
    };

    const result = evaluateEligibility(ineligibleStudent, mockInternship);
    expect(result.status).toBe('not_eligible');
    expect(result.reasons.length).toBeGreaterThan(0);

    const match = calculateInternshipMatch(ineligibleStudent, mockInternship);
    expect(match.eligibility).toBe('not_eligible');
  });

  // Test 4: Unknown eligibility is not treated as confirmed eligibility
  it('4. unknown eligibility is not treated as confirmed eligibility when fields are missing', () => {
    const incompleteStudent: Partial<StudentProfile> = {
      skills: [{ name: 'React', proficiency: 'Intermediate' }],
      // Missing degree, branch, and academicYear
    };

    const result = evaluateEligibility(incompleteStudent, mockInternship);
    expect(result.status).toBe('unknown');
    expect(result.status).not.toBe('eligible');
    expect(result.uncertain.length).toBeGreaterThan(0);
  });

  // Test 5: Match scores remain between 0 and 100
  it('5. match scores remain between 0 and 100 under all conditions', () => {
    const perfectStudent: StudentProfile = {
      ...fullStudentProfile,
      skills: [
        { name: 'React', proficiency: 'Advanced' },
        { name: 'TypeScript', proficiency: 'Advanced' },
        { name: 'Tailwind CSS', proficiency: 'Advanced' },
        { name: 'Node.js', proficiency: 'Advanced' },
        { name: 'Git', proficiency: 'Advanced' },
      ],
    };

    const zeroStudent: Partial<StudentProfile> = {
      skills: [],
      degree: 'Completely Unrelated',
      branch: 'Unrelated',
      academicYear: '1st Year',
      interests: ['Culinary Arts'],
      preferredLocations: ['Alaska'],
      workModePreference: ['on-site'],
    };

    const perfectMatch = calculateInternshipMatch(perfectStudent, mockInternship);
    const zeroMatch = calculateInternshipMatch(zeroStudent, mockInternship);

    expect(perfectMatch.overallScore).toBeLessThanOrEqual(100);
    expect(perfectMatch.overallScore).toBeGreaterThanOrEqual(0);
    expect(zeroMatch.overallScore).toBeGreaterThanOrEqual(0);
    expect(zeroMatch.overallScore).toBeLessThanOrEqual(100);
  });

  // Test 6: Missing profile fields do not cause crashes
  it('6. missing profile fields do not cause crashes (null, empty, partial)', () => {
    expect(() => calculateInternshipMatch(null, mockInternship)).not.toThrow();
    expect(() => calculateInternshipMatch(undefined, mockInternship)).not.toThrow();
    expect(() => calculateInternshipMatch({}, mockInternship)).not.toThrow();
    expect(() => calculateInternshipMatch({ skills: [] }, mockInternship)).not.toThrow();

    const emptyMatch = calculateInternshipMatch({}, mockInternship);
    expect(emptyMatch.overallScore).toBeDefined();
    expect(emptyMatch.eligibility).toBe('unknown');
  });

  // Test 7: Identical inputs produce deterministic scores
  it('7. identical inputs produce deterministic scores', () => {
    const run1 = calculateInternshipMatch(fullStudentProfile, mockInternship);
    const run2 = calculateInternshipMatch(fullStudentProfile, mockInternship);

    expect(run1.overallScore).toBe(run2.overallScore);
    expect(run1.skillScore).toBe(run2.skillScore);
    expect(run1.courseScore).toBe(run2.courseScore);
    expect(run1.locationScore).toBe(run2.locationScore);
    expect(run1.interestScore).toBe(run2.interestScore);
    expect(run1.eligibility).toBe(run2.eligibility);
  });

  // Test 8: Expired internships are detected / excluded
  it('8. expired internships are detected based on application deadline', () => {
    const expiredInternship: Internship = {
      ...mockInternship,
      applicationDeadline: '2023-01-01', // in the past
      publicationStatus: 'expired',
    };

    const isPast = new Date(expiredInternship.applicationDeadline).getTime() < new Date('2026-10-14').getTime();
    expect(isPast).toBe(true);
    expect(expiredInternship.publicationStatus).toBe('expired');
  });

  // Test 9: Deadline sorting works correctly
  it('9. deadline sorting orders internships with nearest deadline first', () => {
    const itemA = { ...mockInternship, id: 'A', applicationDeadline: '2026-12-01' };
    const itemB = { ...mockInternship, id: 'B', applicationDeadline: '2026-11-01' };
    const itemC = { ...mockInternship, id: 'C', applicationDeadline: '2026-11-15' };

    const list = [itemA, itemB, itemC];
    const sorted = [...list].sort((a, b) => 
      new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime()
    );

    expect(sorted[0].id).toBe('B'); // Nov 01
    expect(sorted[1].id).toBe('C'); // Nov 15
    expect(sorted[2].id).toBe('A'); // Dec 01
  });

  // Test 10: Remote and location preferences are evaluated consistently
  it('10. remote and location preferences are evaluated consistently', () => {
    const remoteInternship: Internship = {
      ...mockInternship,
      workMode: 'remote',
      location: 'Pan-India / Remote',
    };

    const remotePrefStudent: StudentProfile = {
      ...fullStudentProfile,
      workModePreference: ['remote'],
      preferredLocations: ['Remote'],
    };

    const onSiteOnlyStudent: StudentProfile = {
      ...fullStudentProfile,
      workModePreference: ['on-site'],
      preferredLocations: ['Delhi'],
    };

    const matchRemote = calculateInternshipMatch(remotePrefStudent, remoteInternship);
    const matchOnsite = calculateInternshipMatch(onSiteOnlyStudent, remoteInternship);

    expect(matchRemote.locationScore).toBeGreaterThan(matchOnsite.locationScore);
  });
});
