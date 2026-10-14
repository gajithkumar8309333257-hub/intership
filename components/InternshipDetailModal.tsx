import { useState } from 'react';
import type { FC } from 'react';
import type { Internship, StudentProfile, ApplicationStatus } from '../types';
import { calculateInternshipMatch } from '../lib/matching';
import { 
  X, 
  Building2, 
  Clock, 
  IndianRupee, 
  Calendar, 
  ExternalLink, 
  Bookmark, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  BookOpen, 
  CheckSquare,
  Info
} from 'lucide-react';
import { saveApplication, getApplications } from '../lib/storage';

interface InternshipDetailModalProps {
  internship: Internship | null;
  student: StudentProfile;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export const InternshipDetailModal: FC<InternshipDetailModalProps> = ({
  internship,
  student,
  isSaved,
  onToggleSave,
  onClose,
  onStatusUpdated,
}) => {
  if (!internship) return null;

  const match = calculateInternshipMatch(student, internship);
  const applications = getApplications();
  const existingApp = applications.find(a => a.internshipId === internship.id);

  const [currentStatus, setCurrentStatus] = useState<ApplicationStatus>(
    existingApp?.status || 'Saved'
  );
  const [appNotes, setAppNotes] = useState<string>(existingApp?.notes || '');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const deadlineDate = new Date(internship.applicationDeadline);
  const isExpired = deadlineDate.getTime() < new Date().getTime() || internship.publicationStatus === 'expired';

  const handleUpdateStatus = (newStatus: ApplicationStatus) => {
    setCurrentStatus(newStatus);
    saveApplication({
      internshipId: internship.id,
      status: newStatus,
      notes: appNotes,
      applicationDate: newStatus === 'Applied' ? new Date().toISOString().split('T')[0] : existingApp?.applicationDate,
    });
    setSaveSuccessMsg(`Application status updated to "${newStatus}"!`);
    if (onStatusUpdated) onStatusUpdated();
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleSaveNotes = () => {
    saveApplication({
      internshipId: internship.id,
      status: currentStatus,
      notes: appNotes,
    });
    setSaveSuccessMsg('Notes saved to application tracker!');
    if (onStatusUpdated) onStatusUpdated();
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              Opportunity Details
            </span>
            {internship.isDemoData && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                [DEMO DATA]
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(internship.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isSaved
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500 text-amber-600' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Main Title & Organization Banner */}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                {internship.organization}
              </span>
              {internship.department && (
                <span className="text-xs text-slate-500">• {internship.department}</span>
              )}

              {internship.verificationStatus === 'verified' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Source Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Unverified Source
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{internship.title}</h1>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Work Mode</span>
                <span className="font-semibold text-slate-800 capitalize flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${
                    internship.workMode === 'remote' ? 'bg-emerald-500' :
                    internship.workMode === 'hybrid' ? 'bg-indigo-500' : 'bg-amber-500'
                  }`} />
                  {internship.workMode} ({internship.location})
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Duration</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {internship.duration}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Stipend</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                  {internship.isUnpaid ? 'Unpaid Opportunity' : `₹${internship.stipend.toLocaleString()} / month`}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Application Deadline</span>
                <span className={`font-semibold flex items-center gap-1 mt-0.5 ${
                  isExpired ? 'text-rose-600' : 'text-slate-800'
                }`}>
                  <Calendar className="w-3.5 h-3.5" />
                  {internship.applicationDeadline} {isExpired ? '(Expired)' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Transparent Matching Engine Breakdown */}
          <div className="bg-gradient-to-br from-indigo-50/70 to-slate-50 p-5 rounded-2xl border border-indigo-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">Deterministic Match Engine Breakdown</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">
                    v1.0 Rules Engine
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Formula: <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[11px]">0.50×Skills + 0.20×Course + 0.15×Location + 0.15×Interest</code>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-700">{match.overallScore}%</span>
                  <span className="block text-[10px] text-slate-500 font-medium">Profile Compatibility</span>
                </div>
              </div>
            </div>

            {/* Score Component Progress Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-700">Skills Match (50% Weight)</span>
                  <span className="font-bold text-indigo-600">{match.skillScore}/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${match.skillScore}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {match.matchingSkills.length} of {internship.requiredSkills.length} required skills satisfied
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-700">Course & Academic Relevance (20% Weight)</span>
                  <span className="font-bold text-indigo-600">{match.courseScore}/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${match.courseScore}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Degree & Branch compatibility with criteria
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-700">Location & Work Mode (15% Weight)</span>
                  <span className="font-bold text-indigo-600">{match.locationScore}/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-teal-500 h-2 rounded-full transition-all" style={{ width: `${match.locationScore}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {internship.workMode.toUpperCase()} mode preference evaluation
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-700">Interests & Role Match (15% Weight)</span>
                  <span className="font-bold text-indigo-600">{match.interestScore}/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${match.interestScore}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Alignment with student target career interests
                </span>
              </div>
            </div>

            {/* Eligibility Status Evaluation */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-slate-800">Mandatory Eligibility Verification:</span>
                {match.eligibility === 'eligible' && (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> All criteria satisfied
                  </span>
                )}
                {match.eligibility === 'not_eligible' && (
                  <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-200">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" /> Not eligible under listed requirements
                  </span>
                )}
                {match.eligibility === 'unknown' && (
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Eligibility Unknown
                  </span>
                )}
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
                {match.eligibilityReasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>

              {match.uncertainFields.length > 0 && (
                <p className="text-[11px] text-amber-800 mt-1.5 bg-amber-50 p-2 rounded border border-amber-200">
                  ⚠️ Note: Profile lacks complete data for: {match.uncertainFields.join(', ')}. Complete your profile to verify confirmation.
                </p>
              )}
            </div>

            <div className="mt-3 flex items-start gap-1.5 text-[11px] text-slate-500 italic">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Transparency Notice: The score is a deterministic rule-based calculation comparing your profile data with opportunity criteria. It is NOT an AI hiring prediction and does not guarantee selection.
              </span>
            </div>
          </div>

          {/* Section: Skill Gap Analysis */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Skill Gap & Readiness Analysis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Matching Skills */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="font-bold text-emerald-900 block mb-1">
                  Matching Skills ({match.matchingSkills.length})
                </span>
                {match.matchingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {match.matchingSkills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-medium">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-[11px]">No exact skill overlap detected yet.</p>
                )}
              </div>

              {/* Missing Mandatory Skills */}
              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
                <span className="font-bold text-rose-900 block mb-1">
                  Missing Mandatory Skills ({match.missingMandatorySkills.length})
                </span>
                {match.missingMandatorySkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {match.missingMandatorySkills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[11px] font-medium">
                        ✗ {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-emerald-700 font-medium text-[11px]">All mandatory skills satisfied!</p>
                )}
              </div>

              {/* Missing Preferred Skills */}
              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">
                  Preferred Skills to Explore ({match.missingPreferredSkills.length})
                </span>
                {match.missingPreferredSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {match.missingPreferredSkills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[11px]">
                        + {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-[11px]">No additional preferred skills required.</p>
                )}
              </div>
            </div>

            {/* Actionable Learning Suggestions & Preparation Tasks */}
            {match.learningSuggestions.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Actionable Preparation Recommendations:
                </h4>
                <div className="space-y-3">
                  {match.learningSuggestions.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                      <p className="font-bold text-indigo-700 mb-1">
                        Topic: {item.description} ({item.skill})
                      </p>
                      <ul className="list-disc list-inside text-slate-600 space-y-1 pl-1">
                        {item.actionableTasks.map((task, tIdx) => (
                          <li key={tIdx}>{task}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-2 italic">
                  * Completing these suggested learning topics develops relevant competencies, but does not guarantee an interview or offer. If mandatory eligibility (e.g. academic year or degree) is not met, skill improvement alone will not alter eligibility.
                </p>
              </div>
            )}
          </div>

          {/* Section: Opportunity Description & Eligibility Conditions */}
          <div className="space-y-3 text-xs text-slate-700">
            <h3 className="text-base font-bold text-slate-900">About the Role</h3>
            <p className="leading-relaxed whitespace-pre-line">{internship.description}</p>

            <div className="pt-2">
              <h4 className="font-bold text-slate-900 mb-1">Eligibility Criteria Listed by Organizer:</h4>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                <li>
                  <strong>Eligible Degrees:</strong>{' '}
                  {internship.eligibleDegrees.length > 0 ? internship.eligibleDegrees.join(', ') : 'Open to all degrees'}
                </li>
                <li>
                  <strong>Eligible Branches:</strong>{' '}
                  {internship.eligibleBranches.length > 0 ? internship.eligibleBranches.join(', ') : 'Open to all branches'}
                </li>
                <li>
                  <strong>Eligible Academic Years:</strong>{' '}
                  {internship.eligibleAcademicYears.length > 0 ? internship.eligibleAcademicYears.join(', ') : 'Open to all years'}
                </li>
                {internship.minCgpa && (
                  <li>
                    <strong>Minimum CGPA:</strong> {internship.minCgpa}
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Sourcing & Verification Metadata (Section 10) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-semibold text-slate-800">
                  Source: {internship.sourceName} ({internship.sourceType.replace('_', ' ')})
                </p>
                <p className="text-[11px] text-slate-500">
                  Last verified timestamp: {new Date(internship.lastVerifiedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">Publication status: </span>
                <span className="font-medium text-slate-800 capitalize">{internship.publicationStatus}</span>
              </div>
            </div>

            {internship.verificationStatus === 'unverified' && (
              <div className="mt-2 p-2 rounded bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Notice: This opportunity has not been directly verified by an administrator. Always confirm company domain and never pay any application fee.
                </span>
              </div>
            )}
          </div>

          {/* Section: Application Tracker Workflow */}
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              Manage Application Tracker Status
            </h3>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              {(['Saved', 'Planning to Apply', 'Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'] as ApplicationStatus[]).map(st => (
                <button
                  key={st}
                  onClick={() => handleUpdateStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    currentStatus === st
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add personal notes (e.g. submitted via portal, referral name, interview round date)..."
                value={appNotes}
                onChange={e => setAppNotes(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                Save Note
              </button>
            </div>

            {saveSuccessMsg && (
              <p className="text-xs text-emerald-700 font-medium mt-2 flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {saveSuccessMsg}
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer / External Apply Action */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            <span>External link will open the genuine organization careers posting.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100"
            >
              Close
            </button>

            <a
              href={internship.originalApplicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Apply on Official Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
