import { useState } from 'react';
import type { FC } from 'react';
import type { Internship, ApplicationRecord, ApplicationStatus } from '../types';
import { saveApplication, deleteApplication } from '../lib/storage';
import { 
  CheckSquare, 
  Building2, 
  Calendar, 
  ExternalLink, 
  Clock, 
  Trash2, 
  Plus
} from 'lucide-react';

interface ApplicationTrackerProps {
  internships: Internship[];
  applications: ApplicationRecord[];
  onOpenDetails: (internship: Internship) => void;
  onNavigateTab: (tab: string) => void;
  onRefresh: () => void;
}

const ALL_STATUSES: ApplicationStatus[] = [
  'Saved',
  'Planning to Apply',
  'Applied',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
];

export const ApplicationTracker: FC<ApplicationTrackerProps> = ({
  internships,
  applications,
  onOpenDetails,
  onNavigateTab,
  onRefresh,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<string>('');
  const [editNextAction, setEditNextAction] = useState<string>('');
  const [editAppDate, setEditAppDate] = useState<string>('');
  const [editInterviewDate, setEditInterviewDate] = useState<string>('');

  const filteredApps = applications.filter(app => {
    if (filterStatus === 'All') return true;
    return app.status === filterStatus;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Offer':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Interview':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Applied':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Planning to Apply':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Saved':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Withdrawn':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const handleStartEdit = (app: ApplicationRecord) => {
    setEditingId(app.id);
    setEditNotes(app.notes || '');
    setEditNextAction(app.nextAction || '');
    setEditAppDate(app.applicationDate || '');
    setEditInterviewDate(app.interviewDate || '');
  };

  const handleSaveEdit = (app: ApplicationRecord) => {
    saveApplication({
      id: app.id,
      internshipId: app.internshipId,
      status: app.status,
      notes: editNotes,
      nextAction: editNextAction,
      applicationDate: editAppDate,
      interviewDate: editInterviewDate,
    });
    setEditingId(null);
    onRefresh();
  };

  const handleStatusChange = (app: ApplicationRecord, newStatus: ApplicationStatus) => {
    saveApplication({
      id: app.id,
      internshipId: app.internshipId,
      status: newStatus,
      notes: app.notes,
      nextAction: app.nextAction,
      applicationDate: newStatus === 'Applied' && !app.applicationDate ? new Date().toISOString().split('T')[0] : app.applicationDate,
      interviewDate: app.interviewDate,
    });
    onRefresh();
  };

  const handleDelete = (internshipId: string) => {
    if (window.confirm('Remove this application record from your tracker?')) {
      deleteApplication(internshipId);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Application Tracker</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Privately track application dates, interview stages, follow-up actions, and interview preparation notes.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('discover')}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Track New Opportunity</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterStatus('All')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
            filterStatus === 'All'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({applications.length})
        </button>

        {ALL_STATUSES.map(st => {
          const count = applications.filter(a => a.status === st).length;
          return (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st} ({count})
            </button>
          );
        })}
      </div>

      {/* Applications List / Cards */}
      {filteredApps.length > 0 ? (
        <div className="space-y-4">
          {filteredApps.map(app => {
            const internship = internships.find(i => i.id === app.internshipId);
            const isEditing = editingId === app.id;

            return (
              <div 
                key={app.id} 
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Header row: Title, Org, Status Selector, Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 
                      onClick={() => internship && onOpenDetails(internship)}
                      className="text-base font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                    >
                      {internship ? internship.title : 'Tracked Opportunity'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {internship ? internship.organization : 'External'}
                      </span>
                      {internship && (
                        <span>• {internship.location} ({internship.workMode})</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status dropdown */}
                    <select
                      value={app.status}
                      onChange={e => handleStatusChange(app, e.target.value as ApplicationStatus)}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${getStatusBadge(app.status)}`}
                    >
                      {ALL_STATUSES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>

                    {internship && (
                      <a
                        href={internship.originalApplicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                        title="Open external application portal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => handleDelete(app.internshipId)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Body: Dates, Next Action, Notes */}
                {isEditing ? (
                  /* Edit Mode */
                  <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Application Date</label>
                        <input
                          type="date"
                          value={editAppDate}
                          onChange={e => setEditAppDate(e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Interview Date (if scheduled)</label>
                        <input
                          type="date"
                          value={editInterviewDate}
                          onChange={e => setEditInterviewDate(e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Next Action Required</label>
                      <input
                        type="text"
                        placeholder="e.g. Follow up with HR in 5 days, prepare system design question..."
                        value={editNextAction}
                        onChange={e => setEditNextAction(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Personal Notes</label>
                      <textarea
                        rows={2}
                        placeholder="Private notes (interviewer name, questions asked, submission confirmation number)..."
                        value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(app)}
                        className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                      >
                        Save Tracker Record
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 block text-[11px] mb-0.5">Timeline</span>
                      <p className="font-medium text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Applied: {app.applicationDate || 'Not specified'}
                      </p>
                      {app.interviewDate && (
                        <p className="font-semibold text-purple-700 flex items-center gap-1 mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          Interview: {app.interviewDate}
                        </p>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 block text-[11px] mb-0.5">Next Action</span>
                      <p className="font-semibold text-slate-800">
                        {app.nextAction || 'No pending action recorded'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                      <div>
                        <span className="text-slate-500 block text-[11px] mb-0.5">Personal Notes</span>
                        <p className="text-slate-700 italic line-clamp-2">
                          {app.notes || 'No private notes added.'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleStartEdit(app)}
                        className="mt-2 text-indigo-600 hover:text-indigo-800 font-semibold text-right"
                      >
                        Edit Details →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            {filterStatus === 'All' ? 'No applications tracked yet' : `No applications in "${filterStatus}" status`}
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Track your internship journey from planning to interview and offers. Applications are kept strictly private to your account.
          </p>
          <button
            onClick={() => onNavigateTab('discover')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Find Opportunities to Track
          </button>
        </div>
      )}
    </div>
  );
};
