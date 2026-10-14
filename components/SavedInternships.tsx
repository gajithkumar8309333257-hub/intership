import type { FC } from 'react';
import type { Internship, StudentProfile } from '../types';
import { InternshipCard } from './InternshipCard';
import { Bookmark, Search } from 'lucide-react';

interface SavedInternshipsProps {
  internships: Internship[];
  savedIds: string[];
  student: StudentProfile;
  onToggleSave: (id: string) => void;
  onOpenDetails: (internship: Internship) => void;
  onNavigateTab: (tab: string) => void;
}

export const SavedInternships: FC<SavedInternshipsProps> = ({
  internships,
  savedIds,
  student,
  onToggleSave,
  onOpenDetails,
  onNavigateTab,
}) => {
  const savedList = internships.filter(item => savedIds.includes(item.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Bookmark className="w-5 h-5 fill-amber-500" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Saved Internships</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Keep track of promising opportunities you plan to research and apply for.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto">
          {savedList.length} bookmarked {savedList.length === 1 ? 'opportunity' : 'opportunities'}
        </div>
      </div>

      {/* Grid of Saved Opportunities */}
      {savedList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedList.map(internship => (
            <InternshipCard
              key={internship.id}
              internship={internship}
              student={student}
              isSaved={true}
              onToggleSave={onToggleSave}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No saved internships yet</h3>
          <p className="text-xs text-slate-500 mb-4">
            Browse through discovery recommendations and click the bookmark icon on any card to save it here.
          </p>
          <button
            onClick={() => onNavigateTab('discover')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Discover Internships</span>
          </button>
        </div>
      )}
    </div>
  );
};
