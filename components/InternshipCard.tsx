import type { FC } from 'react';
import type { Internship, StudentProfile } from '../types';
import { calculateInternshipMatch } from '../lib/matching';
import { 
  Building2, 
  MapPin, 
  Clock, 
  IndianRupee, 
  Bookmark, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

interface InternshipCardProps {
  internship: Internship;
  student: StudentProfile;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onOpenDetails: (internship: Internship) => void;
}

export const InternshipCard: FC<InternshipCardProps> = ({
  internship,
  student,
  isSaved,
  onToggleSave,
  onOpenDetails,
}) => {
  const match = calculateInternshipMatch(student, internship);
  
  // Format deadline and check expiration
  const deadlineDate = new Date(internship.applicationDeadline);
  const now = new Date();
  const isExpired = deadlineDate.getTime() < now.getTime() || internship.publicationStatus === 'expired';
  const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Determine Match Score Color
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-700 bg-emerald-50 border-emerald-200 ring-emerald-500/20';
    if (score >= 50) return 'text-indigo-700 bg-indigo-50 border-indigo-200 ring-indigo-500/20';
    return 'text-slate-600 bg-slate-100 border-slate-200 ring-slate-500/20';
  };

  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden relative ${
      isExpired ? 'opacity-75 border-slate-300' : 'border-slate-200 hover:border-indigo-300'
    }`}>
      {/* Demo Data Tag Badge */}
      {internship.isDemoData && (
        <div className="bg-amber-100/90 text-amber-900 border-b border-amber-200 text-[10px] font-semibold px-3 py-0.5 flex items-center justify-between">
          <span>DEMO DATA — Educational Sample</span>
          <span>Source: {internship.sourceName}</span>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        {/* Top Header: Organization, Verified Badge, Save Action */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {internship.organization}
              </span>

              {internship.verificationStatus === 'verified' ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200" title="Source verified by InternMatch admin team">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Source
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200" title="Community posted, awaiting formal verification">
                  <ShieldAlert className="w-3 h-3 text-amber-600" /> Unverified
                </span>
              )}
            </div>

            <h3 
              onClick={() => onOpenDetails(internship)}
              className="text-base sm:text-lg font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors line-clamp-1"
            >
              {internship.title}
            </h3>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => onToggleSave(internship.id)}
            className={`p-2 rounded-lg transition-colors border ${
              isSaved
                ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                : 'text-slate-400 hover:text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save internship'}
            aria-label="Save internship"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-600' : ''}`} />
          </button>
        </div>

        {/* Core Attributes: Work Mode, Location, Duration, Stipend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 my-3 py-2 px-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${
              internship.workMode === 'remote' ? 'bg-emerald-500' :
              internship.workMode === 'hybrid' ? 'bg-indigo-500' : 'bg-amber-500'
            }`} />
            <span className="capitalize font-medium">{internship.workMode}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-600 truncate" title={internship.location}>
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{internship.location}</span>
          </div>

          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{internship.duration}</span>
          </div>

          <div className="flex items-center gap-1 font-semibold text-slate-800">
            <IndianRupee className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {internship.isUnpaid ? 'Unpaid' : `₹${internship.stipend.toLocaleString()}/mo`}
            </span>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-3">
          {internship.description}
        </p>

        {/* Skill Badges (Highlighting student matching skills in green, missing in gray) */}
        <div className="mb-4">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
            Key Skills ({match.matchingSkills.length}/{internship.requiredSkills.length} match):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {internship.requiredSkills.map(skill => {
              const doesMatch = match.matchingSkills.includes(skill);
              return (
                <span
                  key={skill}
                  className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-all ${
                    doesMatch
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 ring-1 ring-emerald-500/20'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {doesMatch ? `✓ ${skill}` : skill}
                </span>
              );
            })}
            {internship.preferredSkills.slice(0, 2).map(skill => (
              <span
                key={skill}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-200 italic"
                title="Preferred Skill"
              >
                + {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Match Engine Compatibility Bar & Eligibility Badge */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Transparent Score Pill */}
          <div className="flex items-center gap-2">
            <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold tracking-tight ${getScoreColor(match.overallScore)}`}>
              {match.overallScore}% Match
            </div>

            {/* Eligibility Status Pill */}
            {match.eligibility === 'eligible' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Eligible
              </span>
            )}
            {match.eligibility === 'not_eligible' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200" title={match.eligibilityReasons[0]}>
                <XCircle className="w-3.5 h-3.5 text-rose-600" /> Ineligible
              </span>
            )}
            {match.eligibility === 'unknown' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200" title={match.uncertainFields.join(', ')}>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Eligibility Unknown
              </span>
            )}
          </div>

          {/* Deadline indicator */}
          <div className="text-[11px] text-right font-medium">
            {isExpired ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Expired
              </span>
            ) : daysLeft <= 7 ? (
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {daysLeft} days left!
              </span>
            ) : (
              <span className="text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Due {internship.applicationDeadline}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
        <button
          onClick={() => onOpenDetails(internship)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline"
        >
          View Match Breakdown & Skill Gap →
        </button>

        <a
          href={internship.originalApplicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
        >
          Apply <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
