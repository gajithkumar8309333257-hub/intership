import { useState, useEffect } from 'react';
import type { Internship, StudentProfile, ApplicationRecord } from './types';
import { 
  getCurrentProfile, 
  getInternships, 
  getSavedInternshipIds, 
  getApplications, 
  toggleSaveInternship, 
  subscribeToStore 
} from './lib/storage';
import { DemoBanner } from './components/DemoBanner';
import { Navbar } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { DiscoverInternships } from './components/DiscoverInternships';
import { ProfileView } from './components/ProfileView';
import { SavedInternships } from './components/SavedInternships';
import { ApplicationTracker } from './components/ApplicationTracker';
import { AdminPortal } from './components/AdminPortal';
import { InternshipDetailModal } from './components/InternshipDetailModal';
import { Compass, ShieldCheck } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [student, setStudent] = useState<StudentProfile>(getCurrentProfile());
  const [internships, setInternships] = useState<Internship[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync state from storage
  const syncData = async () => {
    const profile = getCurrentProfile();
    const allInternships = await getInternships();
    const saved = getSavedInternshipIds();
    const apps = getApplications();

    setStudent(profile);
    setInternships(allInternships);
    setSavedIds(saved);
    setApplications(apps);
    setLoading(false);
  };

  useEffect(() => {
    syncData();
    const unsubscribe = subscribeToStore(() => {
      syncData();
    });
    return () => unsubscribe();
  }, []);

  const handleToggleSave = (id: string) => {
    toggleSaveInternship(id);
    setSavedIds(getSavedInternshipIds());
  };

  const handleProfileUpdated = (updated: StudentProfile) => {
    setStudent(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* 1. Hackathon Demo Banner */}
      <DemoBanner />

      {/* 2. Responsive Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        profile={student}
        savedCount={savedIds.length}
        applicationCount={applications.length}
      />

      {/* 3. Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold">Loading InternMatch...</p>
          </div>
        ) : (
          <>
            {currentTab === 'home' && (
              <HomeDashboard
                student={student}
                internships={internships}
                savedIds={savedIds}
                applications={applications}
                onNavigateTab={setCurrentTab}
                onToggleSave={handleToggleSave}
                onOpenDetails={setSelectedInternship}
              />
            )}

            {currentTab === 'discover' && (
              <DiscoverInternships
                internships={internships}
                student={student}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                onOpenDetails={setSelectedInternship}
              />
            )}

            {currentTab === 'saved' && (
              <SavedInternships
                internships={internships}
                savedIds={savedIds}
                student={student}
                onToggleSave={handleToggleSave}
                onOpenDetails={setSelectedInternship}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'tracker' && (
              <ApplicationTracker
                internships={internships}
                applications={applications}
                onOpenDetails={setSelectedInternship}
                onNavigateTab={setCurrentTab}
                onRefresh={syncData}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileView
                initialProfile={student}
                onProfileUpdated={handleProfileUpdated}
              />
            )}

            {currentTab === 'admin' && (
              <AdminPortal
                internships={internships}
                currentProfile={student}
                onRefresh={syncData}
              />
            )}
          </>
        )}
      </main>

      {/* 4. Internship Detail & Match Breakdown Modal */}
      {selectedInternship && (
        <InternshipDetailModal
          internship={selectedInternship}
          student={student}
          isSaved={savedIds.includes(selectedInternship.id)}
          onToggleSave={handleToggleSave}
          onClose={() => setSelectedInternship(null)}
          onStatusUpdated={syncData}
        />
      )}

      {/* 5. Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900">InternMatch</span>
            <span>— Transparent, Personalized Internship Discovery</span>
          </div>

          <div className="text-center md:text-right space-y-1">
            <p className="flex items-center justify-center md:justify-end gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Deterministic Match Scoring: 50% Skills • 20% Course • 15% Location • 15% Interests
            </p>
            <p className="text-[10px] text-slate-400">
              External links direct to verified opportunity sources. Sample listings are clearly labeled [DEMO DATA].
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
