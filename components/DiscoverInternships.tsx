import { useState, useMemo } from 'react';
import type { FC } from 'react';
import type { Internship, StudentProfile, InternshipFilterState } from '../types';
import { InternshipCard } from './InternshipCard';
import { calculateInternshipMatch } from '../lib/matching';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  SlidersHorizontal, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';

interface DiscoverInternshipsProps {
  internships: Internship[];
  student: StudentProfile;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onOpenDetails: (internship: Internship) => void;
}

export const DiscoverInternships: FC<DiscoverInternshipsProps> = ({
  internships,
  student,
  savedIds,
  onToggleSave,
  onOpenDetails,
}) => {
  const [filters, setFilters] = useState<InternshipFilterState>({
    searchQuery: '',
    skills: [],
    degree: '',
    branch: '',
    academicYear: '',
    location: '',
    workMode: '',
    roleInterest: '',
    duration: '',
    minStipend: 0,
    verifiedOnly: false,
    hideExpired: true,
    sortBy: 'relevance',
  });

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Common quick-filter skills
  const POPULAR_SKILLS = [
    'React', 'TypeScript', 'Python', 'SQL', 'Node.js', 
    'Machine Learning', 'Tailwind CSS', 'Docker', 'Git', 'Figma'
  ];

  const toggleSkillFilter = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      skills: [],
      degree: '',
      branch: '',
      academicYear: '',
      location: '',
      workMode: '',
      roleInterest: '',
      duration: '',
      minStipend: 0,
      verifiedOnly: false,
      hideExpired: true,
      sortBy: 'relevance',
    });
  };

  // Filter and sort opportunities
  const filteredInternships = useMemo(() => {
    const now = new Date().getTime();

    const result = internships.filter(item => {
      // 1. Hide expired check
      if (filters.hideExpired) {
        const deadline = new Date(item.applicationDeadline).getTime();
        if (deadline < now || item.publicationStatus === 'expired') {
          return false;
        }
      }

      // 2. Search query (title, organization, description, skills)
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const textToMatch = `${item.title} ${item.organization} ${item.description} ${item.location} ${item.requiredSkills.join(' ')}`.toLowerCase();
        if (!textToMatch.includes(q)) return false;
      }

      // 3. Selected skills filter (must contain all selected skills)
      if (filters.skills.length > 0) {
        const allSkills = [...item.requiredSkills, ...item.preferredSkills].map(s => s.toLowerCase());
        const matchesAll = filters.skills.every(sk => allSkills.includes(sk.toLowerCase()));
        if (!matchesAll) return false;
      }

      // 4. Degree filter
      if (filters.degree) {
        if (item.eligibleDegrees.length > 0 && !item.eligibleDegrees.includes(filters.degree)) {
          return false;
        }
      }

      // 5. Branch filter
      if (filters.branch) {
        if (item.eligibleBranches.length > 0 && !item.eligibleBranches.includes(filters.branch)) {
          return false;
        }
      }

      // 6. Academic year filter
      if (filters.academicYear) {
        if (item.eligibleAcademicYears.length > 0 && !item.eligibleAcademicYears.includes(filters.academicYear as any)) {
          return false;
        }
      }

      // 7. Work mode
      if (filters.workMode && item.workMode !== filters.workMode) {
        return false;
      }

      // 8. Location
      if (filters.location && !item.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      // 9. Minimum stipend
      if (filters.minStipend > 0 && item.stipend < filters.minStipend) {
        return false;
      }

      // 10. Verified only
      if (filters.verifiedOnly && item.verificationStatus !== 'verified') {
        return false;
      }

      return true;
    });

    // Sort opportunities
    return result.sort((a, b) => {
      if (filters.sortBy === 'relevance') {
        const matchA = calculateInternshipMatch(student, a);
        const matchB = calculateInternshipMatch(student, b);
        // Prioritize eligible over ineligible, then overall score
        if (matchA.eligibility === 'eligible' && matchB.eligibility !== 'eligible') return -1;
        if (matchB.eligibility === 'eligible' && matchA.eligibility !== 'eligible') return 1;
        return matchB.overallScore - matchA.overallScore;
      }

      if (filters.sortBy === 'deadline') {
        return new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime();
      }

      if (filters.sortBy === 'stipend_desc') {
        return b.stipend - a.stipend;
      }

      if (filters.sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      return 0;
    });
  }, [internships, filters, student]);

  const activeFilterCount = (
    (filters.searchQuery ? 1 : 0) +
    filters.skills.length +
    (filters.degree ? 1 : 0) +
    (filters.branch ? 1 : 0) +
    (filters.academicYear ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.workMode ? 1 : 0) +
    (filters.minStipend > 0 ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    (!filters.hideExpired ? 1 : 0)
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Discover Internships</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Personalized for <strong className="text-slate-900">{student.name}</strong> ({student.degree} {student.branch || ''}, {student.academicYear}) with deterministic compatibility scoring.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activeFilterCount > 0
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-4 h-4 text-indigo-600" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar & Quick Skill Pills */}
        <div className="mt-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by role, company, skills, or location (e.g. React Developer, Bengaluru, Python)..."
              value={filters.searchQuery}
              onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Quick Skill Tags */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] font-medium text-slate-500 mr-1">Popular Skills:</span>
            {POPULAR_SKILLS.map(skill => {
              const active = filters.skills.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => toggleSkillFilter(skill)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Advanced Filter Panel (Collapsible) */}
      {showFilterDrawer && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Advanced Filter Controls</h3>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Clear All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Work Mode */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Work Mode</label>
              <select
                value={filters.workMode}
                onChange={e => setFilters(prev => ({ ...prev, workMode: e.target.value }))}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Modes (Remote, Hybrid, On-site)</option>
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="on-site">On-site Only</option>
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Eligible Academic Year</label>
              <select
                value={filters.academicYear}
                onChange={e => setFilters(prev => ({ ...prev, academicYear: e.target.value }))}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Academic Years</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>

            {/* Degree */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Degree</label>
              <select
                value={filters.degree}
                onChange={e => setFilters(prev => ({ ...prev, degree: e.target.value }))}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Degrees</option>
                <option value="B.Tech">B.Tech</option>
                <option value="B.Sc">B.Sc</option>
                <option value="BCA">BCA</option>
                <option value="MCA">MCA</option>
                <option value="M.Tech">M.Tech</option>
              </select>
            </div>

            {/* Minimum Stipend */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Minimum Stipend: {filters.minStipend > 0 ? `₹${filters.minStipend.toLocaleString()}` : 'Any (Including Unpaid)'}
              </label>
              <select
                value={filters.minStipend}
                onChange={e => setFilters(prev => ({ ...prev, minStipend: Number(e.target.value) }))}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="0">Any / No Minimum</option>
                <option value="10000">₹10,000+ / month</option>
                <option value="15000">₹15,000+ / month</option>
                <option value="20000">₹20,000+ / month</option>
                <option value="25000">₹25,000+ / month</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={e => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Verified Sources Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <input
                type="checkbox"
                checked={filters.hideExpired}
                onChange={e => setFilters(prev => ({ ...prev, hideExpired: e.target.checked }))}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Hide Expired Opportunities</span>
            </label>
          </div>
        </div>
      )}

      {/* Sort & Results Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
        <span className="font-semibold text-slate-700">
          Showing <strong className="text-indigo-600">{filteredInternships.length}</strong> opportunities
          {activeFilterCount > 0 && ` (Filtered)`}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Sort By:</span>
          <select
            value={filters.sortBy}
            onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="p-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="relevance">Best Match (Compatibility & Eligibility)</option>
            <option value="deadline">Application Deadline (Closing Soonest)</option>
            <option value="stipend_desc">Stipend (Highest First)</option>
            <option value="newest">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Opportunity Cards Grid */}
      {filteredInternships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInternships.map(internship => (
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
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No matching opportunities found</h3>
          <p className="text-xs text-slate-500 mb-4">
            Try adjusting your search terms, clearing specific skill filters, or toggling off "Hide Expired".
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
