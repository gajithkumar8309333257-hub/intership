import type { Internship, StudentProfile, ApplicationRecord } from '../types';
import { INITIAL_INTERNSHIPS } from '../data/sampleInternships';
import { DEMO_PROFILES } from '../data/demoProfiles';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  CURRENT_PERSONA: 'internmatch_current_persona',
  CUSTOM_PROFILE: 'internmatch_custom_profile',
  INTERNSHIPS: 'internmatch_internships',
  SAVED_IDS: 'internmatch_saved_ids',
  APPLICATIONS: 'internmatch_applications',
};

// Event listeners for reactive state updates
type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach(cb => {
    try {
      cb();
    } catch (e) {
      console.error('Error notifying listener:', e);
    }
  });
}

export function subscribeToStore(cb: Listener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

// -------------------------------------------------------------
// PROFILE & PERSONA
// -------------------------------------------------------------
export function getCurrentPersonaKey(): string {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_PERSONA) || 'student-priya';
}

export function getCurrentProfile(): StudentProfile {
  const currentKey = getCurrentPersonaKey();
  const customJson = localStorage.getItem(`${STORAGE_KEYS.CUSTOM_PROFILE}_${currentKey}`);
  if (customJson) {
    try {
      return JSON.parse(customJson);
    } catch {
      // fallback to demo profile
    }
  }
  return DEMO_PROFILES[currentKey] || DEMO_PROFILES['student-priya'];
}

export function saveCurrentProfile(profile: StudentProfile): void {
  const currentKey = getCurrentPersonaKey();
  localStorage.setItem(`${STORAGE_KEYS.CUSTOM_PROFILE}_${currentKey}`, JSON.stringify(profile));
  notifyListeners();
}

export function switchPersona(personaKey: string): void {
  if (DEMO_PROFILES[personaKey]) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PERSONA, personaKey);
    notifyListeners();
  }
}

// -------------------------------------------------------------
// INTERNSHIPS
// -------------------------------------------------------------
export async function getInternships(): Promise<Internship[]> {
  // If Supabase is connected, attempt to fetch from Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('internships')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data && data.length > 0) {
        return data as unknown as Internship[];
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local dataset', err);
    }
  }

  // Local storage fallback
  const raw = localStorage.getItem(STORAGE_KEYS.INTERNSHIPS);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // ignore
    }
  }

  // Seed with initial sample opportunities
  localStorage.setItem(STORAGE_KEYS.INTERNSHIPS, JSON.stringify(INITIAL_INTERNSHIPS));
  return INITIAL_INTERNSHIPS;
}

export async function saveInternship(internship: Internship): Promise<void> {
  // Save locally
  const current = await getInternships();
  const index = current.findIndex(item => item.id === internship.id);
  let updated: Internship[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...internship, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...internship, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...current];
  }
  localStorage.setItem(STORAGE_KEYS.INTERNSHIPS, JSON.stringify(updated));

  // Sync to Supabase if available
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('internships').upsert({
        id: internship.id,
        title: internship.title,
        organization: internship.organization,
        description: internship.description,
        location: internship.location,
        work_mode: internship.workMode,
        duration: internship.duration,
        stipend: internship.stipend,
        application_deadline: internship.applicationDeadline,
        original_application_url: internship.originalApplicationUrl,
        source_name: internship.sourceName,
        source_type: internship.sourceType,
        verification_status: internship.verificationStatus,
        last_verified_at: internship.lastVerifiedAt,
        publication_status: internship.publicationStatus,
        is_demo_data: internship.isDemoData,
        required_skills: internship.requiredSkills,
        preferred_skills: internship.preferredSkills,
        eligible_degrees: internship.eligibleDegrees,
        eligible_branches: internship.eligibleBranches,
        eligible_academic_years: internship.eligibleAcademicYears,
      });
    } catch (e) {
      console.warn('Supabase sync error:', e);
    }
  }

  notifyListeners();
}

export async function deleteInternship(id: string): Promise<void> {
  const current = await getInternships();
  const filtered = current.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.INTERNSHIPS, JSON.stringify(filtered));

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('internships').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete error:', e);
    }
  }

  notifyListeners();
}

// -------------------------------------------------------------
// SAVED INTERNSHIPS
// -------------------------------------------------------------
export function getSavedInternshipIds(): string[] {
  const profile = getCurrentProfile();
  const raw = localStorage.getItem(`${STORAGE_KEYS.SAVED_IDS}_${profile.id}`);
  if (!raw) return ['intern-001']; // default initial bookmark for demo
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function toggleSaveInternship(internshipId: string): boolean {
  const profile = getCurrentProfile();
  const saved = new Set(getSavedInternshipIds());
  let isNowSaved = false;

  if (saved.has(internshipId)) {
    saved.delete(internshipId);
    isNowSaved = false;
  } else {
    saved.add(internshipId);
    isNowSaved = true;
  }

  localStorage.setItem(
    `${STORAGE_KEYS.SAVED_IDS}_${profile.id}`,
    JSON.stringify(Array.from(saved))
  );
  notifyListeners();
  return isNowSaved;
}

// -------------------------------------------------------------
// APPLICATIONS TRACKER
// -------------------------------------------------------------
export function getApplications(): ApplicationRecord[] {
  const profile = getCurrentProfile();
  const raw = localStorage.getItem(`${STORAGE_KEYS.APPLICATIONS}_${profile.id}`);
  if (!raw) {
    // Seed initial demo application for Student Priya
    if (profile.id === 'student-priya') {
      const initial: ApplicationRecord[] = [
        {
          id: 'app-init-1',
          userId: 'student-priya',
          internshipId: 'intern-001',
          status: 'Applied',
          applicationDate: '2026-10-12',
          nextAction: 'Prepare for technical frontend assessment round',
          notes: 'Completed the online form on company portal. Mentioned portfolio link.',
          updatedAt: '2026-10-12T10:00:00Z',
        }
      ];
      localStorage.setItem(`${STORAGE_KEYS.APPLICATIONS}_${profile.id}`, JSON.stringify(initial));
      return initial;
    }
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveApplication(record: Partial<ApplicationRecord> & { internshipId: string }): void {
  const profile = getCurrentProfile();
  const current = getApplications();
  const existingIdx = current.findIndex(a => a.internshipId === record.internshipId);

  let updated: ApplicationRecord[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = {
      ...updated[existingIdx],
      ...record,
      updatedAt: new Date().toISOString(),
    };
  } else {
    const newRecord: ApplicationRecord = {
      id: record.id || `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: profile.id,
      internshipId: record.internshipId,
      status: record.status || 'Applied',
      applicationDate: record.applicationDate || new Date().toISOString().split('T')[0],
      interviewDate: record.interviewDate,
      nextAction: record.nextAction || '',
      notes: record.notes || '',
      updatedAt: new Date().toISOString(),
    };
    updated = [newRecord, ...current];
  }

  localStorage.setItem(`${STORAGE_KEYS.APPLICATIONS}_${profile.id}`, JSON.stringify(updated));
  notifyListeners();
}

export function deleteApplication(internshipId: string): void {
  const profile = getCurrentProfile();
  const current = getApplications();
  const filtered = current.filter(a => a.internshipId !== internshipId);
  localStorage.setItem(`${STORAGE_KEYS.APPLICATIONS}_${profile.id}`, JSON.stringify(filtered));
  notifyListeners();
}
