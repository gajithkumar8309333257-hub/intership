import type { StudentProfile, Internship, MatchBreakdown, EligibilityStatus } from '../types';

/**
 * Standardizes skill strings for case-insensitive and whitespace-tolerant comparison.
 * Supports common synonyms (e.g. 'js' -> 'javascript', 'ts' -> 'typescript', 'react.js' -> 'react').
 */
export function normalizeSkill(skill: string): string {
  const cleaned = skill.trim().toLowerCase().replace(/[-_.]/g, '');
  const synonyms: Record<string, string> = {
    'js': 'javascript',
    'javascript': 'javascript',
    'ts': 'typescript',
    'typescript': 'typescript',
    'reactjs': 'react',
    'react': 'react',
    'nodejs': 'node',
    'node': 'node',
    'py': 'python',
    'python': 'python',
    'cpp': 'c++',
    'cplusplus': 'c++',
    'csharp': 'c#',
    'golang': 'go',
    'ml': 'machine learning',
    'machinelearning': 'machine learning',
    'ai': 'artificial intelligence',
    'artificialintelligence': 'artificial intelligence',
    'uiux': 'ui/ux',
    'uxui': 'ui/ux',
    'postgres': 'postgresql',
    'postgresdb': 'postgresql',
  };
  return synonyms[cleaned] || cleaned;
}

/**
 * Curated learning roadmap tasks for common tech & software skills
 */
const SKILL_LEARNING_GUIDES: Record<string, { topic: string; tasks: string[] }> = {
  'react': {
    topic: 'React Core & Component Architecture',
    tasks: [
      'Build a component hierarchy with state and effect hooks (useState, useEffect, useMemo).',
      'Implement client-side routing and state management patterns.',
      'Create an interactive small project like a task planner or movie search app.'
    ]
  },
  'typescript': {
    topic: 'TypeScript Type Safety & Modern Patterns',
    tasks: [
      'Learn interfaces, union types, type guards, and generics.',
      'Migrate a small vanilla JS utility to TypeScript with strict type checking.',
      'Practice typing API response shapes and React component props.'
    ]
  },
  'python': {
    topic: 'Python Programming & Idiomatic Practices',
    tasks: [
      'Master data structures (lists, dicts, sets, comprehensions) and file I/O.',
      'Explore standard libraries, virtual environments, and package managers (pip, uv).',
      'Build a CLI tool or web scraper adhering to PEP 8 standards.'
    ]
  },
  'node': {
    topic: 'Node.js & Backend REST APIs',
    tasks: [
      'Understand event loop, asynchronous I/O, and Promises.',
      'Build a RESTful API using Express or Fastify with JSON validation.',
      'Implement middleware for error handling, logging, and CORS.'
    ]
  },
  'sql': {
    topic: 'Relational Database Queries & Schema Design',
    tasks: [
      'Master JOINs, GROUP BY, aggregations, and subqueries.',
      'Learn indexing strategies and transaction integrity (ACID).',
      'Design a normalized relational schema with primary and foreign keys.'
    ]
  },
  'postgresql': {
    topic: 'PostgreSQL Advanced Querying & Constraints',
    tasks: [
      'Practice writing complex joins, indexing, and window functions.',
      'Understand Row-Level Security (RLS) policies and triggers.',
      'Configure connection pooling and analyze query execution with EXPLAIN ANALYZE.'
    ]
  },
  'docker': {
    topic: 'Containerization & Docker Fundamentals',
    tasks: [
      'Write a multi-stage Dockerfile for a web application.',
      'Configure docker-compose for multi-container development (web + database).',
      'Understand container networking, volumes, and layer caching.'
    ]
  },
  'git': {
    topic: 'Git Version Control & Collaboration Workflows',
    tasks: [
      'Practice branching, merging, rebasing, and resolving merge conflicts.',
      'Create descriptive commits and open well-documented pull requests.',
      'Explore git interactive rebase and cherry-pick commands.'
    ]
  },
  'machine learning': {
    topic: 'Machine Learning Foundations & Scikit-Learn',
    tasks: [
      'Understand supervised vs unsupervised learning and data preprocessing.',
      'Train and evaluate classification & regression models with train/test splits.',
      'Learn cross-validation, feature scaling, and performance metrics (Precision, Recall, F1).'
    ]
  },
  'tailwind css': {
    topic: 'Tailwind CSS Utility-First Responsive Design',
    tasks: [
      'Learn responsive breakpoints (sm, md, lg, xl) and flexbox/grid utilities.',
      'Configure custom theme colors, spacing, and dark mode classes.',
      'Build a fully responsive landing page card layout.'
    ]
  }
};

/**
 * Checks mandatory eligibility requirements:
 * 1. Eligible Degrees
 * 2. Eligible Branches
 * 3. Eligible Academic Years
 * 
 * Separate from weighted score.
 */
export function evaluateEligibility(
  student: Partial<StudentProfile> | null | undefined,
  internship: Internship
): { status: EligibilityStatus; reasons: string[]; uncertain: string[] } {
  const reasons: string[] = [];
  const uncertain: string[] = [];

  if (!student) {
    return {
      status: 'unknown',
      reasons: ['No student profile provided.'],
      uncertain: ['Degree', 'Branch', 'Academic Year']
    };
  }

  let failedMandatory = false;

  // 1. Degree Eligibility
  if (internship.eligibleDegrees && internship.eligibleDegrees.length > 0) {
    if (!student.degree || student.degree.trim() === '') {
      uncertain.push('Student degree not specified in profile');
    } else {
      const studentDeg = student.degree.trim().toLowerCase();
      const isEligible = internship.eligibleDegrees.some(deg =>
        deg.toLowerCase() === studentDeg ||
        studentDeg.includes(deg.toLowerCase()) ||
        deg.toLowerCase().includes(studentDeg)
      );
      if (!isEligible) {
        failedMandatory = true;
        reasons.push(
          `Degree mismatch: requires ${internship.eligibleDegrees.join(', ')}, but profile indicates ${student.degree}.`
        );
      }
    }
  }

  // 2. Branch Eligibility
  if (internship.eligibleBranches && internship.eligibleBranches.length > 0) {
    if (!student.branch || student.branch.trim() === '') {
      uncertain.push('Student branch/specialization not specified in profile');
    } else {
      const studentBranch = student.branch.trim().toLowerCase();
      const isEligible = internship.eligibleBranches.some(br =>
        br.toLowerCase() === studentBranch ||
        studentBranch.includes(br.toLowerCase()) ||
        br.toLowerCase().includes(studentBranch) ||
        (studentBranch.includes('computer') && br.toLowerCase().includes('cs'))
      );
      if (!isEligible) {
        failedMandatory = true;
        reasons.push(
          `Branch requirement not satisfied: requires ${internship.eligibleBranches.join(', ')}, but profile indicates ${student.branch}.`
        );
      }
    }
  }

  // 3. Academic Year Eligibility
  if (internship.eligibleAcademicYears && internship.eligibleAcademicYears.length > 0) {
    if (!student.academicYear || student.academicYear.trim() === '') {
      uncertain.push('Academic year not specified in profile');
    } else {
      const isEligible = internship.eligibleAcademicYears.includes(student.academicYear as any);
      if (!isEligible) {
        failedMandatory = true;
        reasons.push(
          `Academic year requirement: open to ${internship.eligibleAcademicYears.join(', ')}, but profile indicates ${student.academicYear}.`
        );
      }
    }
  }

  if (failedMandatory) {
    return { status: 'not_eligible', reasons, uncertain };
  }

  if (uncertain.length > 0) {
    return { status: 'unknown', reasons: ['Some eligibility fields remain unverified in your profile.'], uncertain };
  }

  return {
    status: 'eligible',
    reasons: ['All listed mandatory eligibility requirements (Degree, Branch, Academic Year) are satisfied.'],
    uncertain: []
  };
}

/**
 * Calculates deterministic match score & skill-gap breakdown:
 * - Skill Match: 50%
 * - Course Match: 20%
 * - Location & Work-Mode: 15%
 * - Interest Match: 15%
 */
export function calculateInternshipMatch(
  student: Partial<StudentProfile> | null | undefined,
  internship: Internship
): MatchBreakdown {
  // Safe defaults if student is missing or has empty fields
  const studentSkills = student?.skills || [];
  const normalizedStudentSkills = new Map<string, string>();
  studentSkills.forEach(s => {
    normalizedStudentSkills.set(normalizeSkill(s.name), s.proficiency);
  });

  // 1. Skill Match (50% Weight)
  const requiredSkills = internship.requiredSkills || [];
  const preferredSkills = internship.preferredSkills || [];
  
  const matchingSkills: string[] = [];
  const missingMandatorySkills: string[] = [];
  const missingPreferredSkills: string[] = [];
  
  let requiredSkillPoints = 0;
  let maxRequiredPoints = requiredSkills.length > 0 ? requiredSkills.length * 10 : 0;

  requiredSkills.forEach(reqSkill => {
    const norm = normalizeSkill(reqSkill);
    if (normalizedStudentSkills.has(norm)) {
      matchingSkills.push(reqSkill);
      const prof = normalizedStudentSkills.get(norm);
      // Proficiency bonus: Beginner = 8pts, Intermediate = 10pts, Advanced = 10pts
      if (prof === 'Beginner') {
        requiredSkillPoints += 8;
      } else {
        requiredSkillPoints += 10;
      }
    } else {
      missingMandatorySkills.push(reqSkill);
    }
  });

  let preferredSkillPoints = 0;
  let maxPreferredPoints = preferredSkills.length > 0 ? preferredSkills.length * 5 : 0;

  preferredSkills.forEach(prefSkill => {
    const norm = normalizeSkill(prefSkill);
    if (normalizedStudentSkills.has(norm)) {
      if (!matchingSkills.includes(prefSkill)) {
        matchingSkills.push(prefSkill);
      }
      preferredSkillPoints += 5;
    } else {
      missingPreferredSkills.push(prefSkill);
    }
  });

  let skillScore = 0;
  const totalSkillMax = maxRequiredPoints + maxPreferredPoints;
  if (totalSkillMax === 0) {
    // If an internship lists zero required skills, default to neutral 70 score
    skillScore = 70;
  } else {
    // Required skills comprise 80% of skill score, preferred skills comprise 20%
    const reqNormalized = maxRequiredPoints > 0 ? (requiredSkillPoints / maxRequiredPoints) * 100 : 100;
    const prefNormalized = maxPreferredPoints > 0 ? (preferredSkillPoints / maxPreferredPoints) * 100 : 100;
    
    if (maxPreferredPoints > 0 && maxRequiredPoints > 0) {
      skillScore = Math.round(0.80 * reqNormalized + 0.20 * prefNormalized);
    } else if (maxRequiredPoints > 0) {
      skillScore = Math.round(reqNormalized);
    } else {
      skillScore = Math.round(prefNormalized);
    }
  }
  skillScore = Math.min(100, Math.max(0, skillScore));

  // 2. Course & Academic Relevance (20% Weight)
  let courseScore = 50; // default baseline
  const matchedPreferences: string[] = [];

  if (internship.eligibleDegrees.length > 0 && student?.degree) {
    const studentDeg = student.degree.trim().toLowerCase();
    const matchesDegree = internship.eligibleDegrees.some(deg =>
      deg.toLowerCase() === studentDeg ||
      studentDeg.includes(deg.toLowerCase()) ||
      deg.toLowerCase().includes(studentDeg)
    );
    if (matchesDegree) {
      courseScore += 25;
      matchedPreferences.push(`Eligible Degree: ${student.degree}`);
    } else {
      courseScore = Math.max(0, courseScore - 30);
    }
  } else if (internship.eligibleDegrees.length === 0) {
    courseScore += 25; // open to all degrees
  }

  if (internship.eligibleBranches.length > 0 && student?.branch) {
    const studentBranch = student.branch.trim().toLowerCase();
    const matchesBranch = internship.eligibleBranches.some(br =>
      br.toLowerCase() === studentBranch ||
      studentBranch.includes(br.toLowerCase()) ||
      br.toLowerCase().includes(studentBranch)
    );
    if (matchesBranch) {
      courseScore += 25;
      matchedPreferences.push(`Eligible Branch: ${student.branch}`);
    } else {
      courseScore = Math.max(0, courseScore - 20);
    }
  } else if (internship.eligibleBranches.length === 0) {
    courseScore += 25;
  }
  courseScore = Math.min(100, Math.max(0, courseScore));

  // 3. Location & Work-Mode Preference (15% Weight)
  let locationScore = 0;
  const prefModes = student?.workModePreference || [];
  const prefLocations = (student?.preferredLocations || []).map(l => l.trim().toLowerCase());

  // Check work mode
  const modeMatches = prefModes.length === 0 || prefModes.includes(internship.workMode);
  if (modeMatches) {
    locationScore += 50;
    matchedPreferences.push(`Work Mode: ${internship.workMode.toUpperCase()}`);
  }

  // Check location
  if (internship.workMode === 'remote') {
    // If it's remote, full location score if student allows remote or unspecified
    if (prefModes.length === 0 || prefModes.includes('remote')) {
      locationScore += 50;
    }
  } else {
    // On-site or hybrid: check location matching
    const internLoc = (internship.location || '').trim().toLowerCase();
    const locMatch = prefLocations.length === 0 || prefLocations.some(pl => 
      internLoc.includes(pl) || pl.includes(internLoc) || pl === 'any'
    );
    if (locMatch) {
      locationScore += 50;
      if (internship.location) {
        matchedPreferences.push(`Location: ${internship.location}`);
      }
    }
  }
  locationScore = Math.min(100, Math.max(0, locationScore));

  // 4. Interest & Role Match (15% Weight)
  let interestScore = 40; // baseline
  const interests = (student?.interests || []).map(i => i.toLowerCase().trim());
  
  if (interests.length > 0) {
    const targetText = `${internship.title} ${internship.description} ${internship.department || ''}`.toLowerCase();
    let interestHits = 0;
    interests.forEach(interest => {
      if (targetText.includes(interest)) {
        interestHits++;
        matchedPreferences.push(`Role/Interest: ${interest}`);
      }
    });

    if (interestHits > 0) {
      interestScore = Math.min(100, 50 + interestHits * 25);
    } else {
      interestScore = 30;
    }
  } else {
    // Neutral when student hasn't specified interests yet
    interestScore = 60;
  }
  interestScore = Math.min(100, Math.max(0, interestScore));

  // Overall Weighted Score:
  // score = 0.50 * skill_match + 0.20 * course_match + 0.15 * location_match + 0.15 * interest_match
  const overallScore = Math.round(
    0.50 * skillScore +
    0.20 * courseScore +
    0.15 * locationScore +
    0.15 * interestScore
  );

  // Evaluate eligibility separately
  const eligibilityResult = evaluateEligibility(student, internship);

  // Generate skill-gap actionable learning suggestions
  const learningSuggestions = missingMandatorySkills.concat(missingPreferredSkills).slice(0, 3).map(skillName => {
    const norm = normalizeSkill(skillName);
    const guide = SKILL_LEARNING_GUIDES[norm] || {
      topic: `${skillName} Practical Fundamentals`,
      tasks: [
        `Study foundational documentation and best practices for ${skillName}.`,
        `Build a hands-on mini project implementing real-world ${skillName} features.`,
        `Review open source codebases or tutorials utilizing ${skillName}.`
      ]
    };

    return {
      skill: skillName,
      description: guide.topic,
      actionableTasks: guide.tasks
    };
  });

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    skillScore,
    courseScore,
    locationScore,
    interestScore,
    eligibility: eligibilityResult.status,
    eligibilityReasons: eligibilityResult.reasons,
    matchingSkills,
    missingMandatorySkills,
    missingPreferredSkills,
    matchedPreferences: Array.from(new Set(matchedPreferences)),
    uncertainFields: eligibilityResult.uncertain,
    learningSuggestions
  };
}
