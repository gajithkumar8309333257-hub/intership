import type { FC } from 'react';
import type { Internship, StudentProfile, ApplicationRecord } from '../types';
import { calculateInternshipMatch } from '../lib/matching';
import { InternshipCard } from './InternshipCard';
import { 
  Sparkles, 
  Bookmark, 
  CheckSquare, 
  Calendar, 
  ArrowRight, 
  Building2, 
  Award, 
  TrendingUp,
  Clock
} from 'lucide-react';

interface HomeDashboardProps {
  student: StudentProfile;
  internships: Internship[];
  savedIds: string[];
  applications: ApplicationRecord[];
  onNavigateTab: (tab: string) => void;
  onToggleSave: (id: string) => void;
  onOpenDetails: (internship: Internship) => void;
}

export const HomeDashboard: FC<HomeDashboardProps> = ({
  student,
  internships,
  savedIds,
  applications,
  onNavigateTab,
  onToggleSave,
  onOpenDetails,
}) => {
  const now = new Date().getTime();

  // Active (non-expired) internships
  const activeInternships = internships.filter(item => {
    const deadline = new Date(item.applicationDeadline).getTime();
    return deadline >= now && item.publicationStatus === 'published';
  });

  // Calculate matches for active internships
  const rankedOpportunities = activeInternships.map(internship => ({
    internship,
    match: calculateInternshipMatch(student, internship)
  })).sort((a, b) => {
    // Prioritize eligible opportunities, then highest score
    if (a.match.eligibility === 'eligible' && b.match.eligibility !== 'eligible') return -1;
    if (b.match.eligibility === 'eligible' && a.match.eligibility !== 'eligible') return 1;
    return b.match.overallScore - a.match.overallScore;
  });

  const highMatchCount = rankedOpportunities.filter(o => o.match.overallScore >= 70).length;
  
  // Upcoming deadlines in next 14 days
  const upcomingDeadlines = activeInternships.filter(item => {
    const deadline = new Date(item.applicationDeadline).getTime();
    const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 14;
  }).sort((a, b) => new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime());

  // Top 3 recommendations
  const topRecommendations = rankedOpportunities.slice(0, 3).map(r => r.internship);

  return (
    <div className="space-y-6">
      {/* Welcome Hero Card */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-semibold mb-3 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" /> Welcome back to InternMatch
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            Hello, {student.name}!
          </h1>

          <p className="text-sm text-indigo-100/90 leading-relaxed mb-6">
            We discovered <strong className="text-white underline decoration-indigo-400">{highMatchCount} high-compatibility</strong> opportunities matching your {student.degree} {student.branch || ''} profile and skills ({student.skills.map(s => s.name).slice(0, 3).join(', ')}).
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('discover')}
              className="px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs sm:text-sm hover:bg-indigo-50 shadow-md transition-all flex items-center gap-2"
            >
              Explore Recommendations <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('profile')}
              className="px-4 py-2.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-900/90 text-white font-medium text-xs sm:text-sm border border-indigo-400/30 transition-colors"
            >
              Refine Skills & Preferences
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Dashboard Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: High Matches */}
        <div 
          onClick={() => onNavigateTab('discover')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">High Matches</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-0.5">{highMatchCount}</div>
          <p className="text-[11px] text-slate-500 font-medium">≥ 70% profile match score</p>
        </div>

        {/* Metric 2: Saved Internships */}
        <div 
          onClick={() => onNavigateTab('saved')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Saved Opportunities</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-0.5">{savedIds.length}</div>
          <p className="text-[11px] text-slate-500 font-medium">Bookmarked for later</p>
        </div>

        {/* Metric 3: Active Applications */}
        <div 
          onClick={() => onNavigateTab('tracker')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Applications Tracked</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-0.5">{applications.length}</div>
          <p className="text-[11px] text-slate-500 font-medium">In your personal pipeline</p>
        </div>

        {/* Metric 4: Upcoming Deadlines */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Upcoming Deadlines</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-0.5">{upcomingDeadlines.length}</div>
          <p className="text-[11px] text-slate-500 font-medium">Closing within 14 days</p>
        </div>
      </div>

      {/* Main Content Layout: Top Recommendations (Left) + Deadlines & Applications (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top 3 Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Top Personalized Recommendations</h2>
            </div>
            <button
              onClick={() => onNavigateTab('discover')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
            >
              View all ({activeInternships.length}) →
            </button>
          </div>

          <div className="space-y-4">
            {topRecommendations.map(internship => (
              <InternshipCard
                key={internship.id}
                internship={internship}
                student={student}
                isSaved={savedIds.includes(internship.id)}
                onToggleSave={onToggleSave}
                onOpenDetails={onOpenDetails}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Upcoming Deadlines & Tracker Snapshot */}
        <div className="space-y-6">
          {/* Upcoming Deadlines Widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Closing Soon</h3>
            </div>

            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadlines.slice(0, 4).map(item => {
                  const days = Math.ceil((new Date(item.applicationDeadline).getTime() - now) / (1000 * 60 * 60 * 24));
                  return (
                    <div 
                      key={item.id}
                      onClick={() => onOpenDetails(item)}
                      className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-white cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 shrink-0">
                          {days}d left
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" /> {item.organization}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No urgent deadlines in the next 14 days.</p>
            )}
          </div>

          {/* Active Applications Tracker Snapshot */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Application Pipeline</h3>
              </div>
              <button
                onClick={() => onNavigateTab('tracker')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Open Tracker →
              </button>
            </div>

            {applications.length > 0 ? (
              <div className="space-y-2.5">
                {applications.slice(0, 4).map(app => {
                  const targetIntern = internships.find(i => i.id === app.internshipId);
                  return (
                    <div key={app.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                          {targetIntern ? targetIntern.title : 'Internship Application'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                          {app.status}
                        </span>
                      </div>
                      {app.nextAction && (
                        <p className="text-[11px] text-slate-500 truncate">
                          Next: {app.nextAction}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-500">
                <p className="text-xs">No active applications tracked yet.</p>
                <button
                  onClick={() => onNavigateTab('discover')}
                  className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Discover and apply to opportunities →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
