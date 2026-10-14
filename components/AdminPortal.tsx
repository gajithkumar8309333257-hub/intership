import { useState } from 'react';
import type { FC, FormEvent, ChangeEvent } from 'react';
import type { Internship, WorkMode, VerificationStatus, PublicationStatus, AcademicYear, StudentProfile } from '../types';
import { saveInternship, deleteInternship } from '../lib/storage';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  UploadCloud, 
  CheckCircle2, 
  Edit3, 
  Lock, 
  Download
} from 'lucide-react';

interface AdminPortalProps {
  internships: Internship[];
  currentProfile: StudentProfile;
  onRefresh: () => void;
}

export const AdminPortal: FC<AdminPortalProps> = ({
  internships,
  currentProfile,
  onRefresh,
}) => {
  const isAdmin = currentProfile.role === 'admin';

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [csvImportReport, setCsvImportReport] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    description: '',
    department: '',
    location: '',
    workMode: 'hybrid' as WorkMode,
    duration: '3 Months',
    stipend: 20000,
    isUnpaid: false,
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    originalApplicationUrl: '',
    sourceName: '',
    sourceType: 'career_portal' as any,
    verificationStatus: 'verified' as VerificationStatus,
    publicationStatus: 'published' as PublicationStatus,
    isDemoData: false,
    requiredSkillsStr: '',
    preferredSkillsStr: '',
    eligibleDegreesStr: 'B.Tech, B.Sc, BCA',
    eligibleBranchesStr: 'Computer Science, Information Technology',
    eligibleAcademicYearsStr: '3rd Year, 4th Year',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      organization: '',
      description: '',
      department: '',
      location: '',
      workMode: 'hybrid',
      duration: '3 Months',
      stipend: 20000,
      isUnpaid: false,
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      originalApplicationUrl: '',
      sourceName: '',
      sourceType: 'career_portal',
      verificationStatus: 'verified',
      publicationStatus: 'published',
      isDemoData: false,
      requiredSkillsStr: '',
      preferredSkillsStr: '',
      eligibleDegreesStr: 'B.Tech, B.Sc, BCA',
      eligibleBranchesStr: 'Computer Science, Information Technology',
      eligibleAcademicYearsStr: '3rd Year, 4th Year',
    });
    setEditingInternship(null);
    setShowAddForm(false);
  };

  const handleStartEdit = (item: Internship) => {
    setEditingInternship(item);
    setFormData({
      title: item.title,
      organization: item.organization,
      description: item.description,
      department: item.department || '',
      location: item.location,
      workMode: item.workMode,
      duration: item.duration,
      stipend: item.stipend,
      isUnpaid: item.isUnpaid,
      applicationDeadline: item.applicationDeadline,
      originalApplicationUrl: item.originalApplicationUrl,
      sourceName: item.sourceName,
      sourceType: item.sourceType,
      verificationStatus: item.verificationStatus,
      publicationStatus: item.publicationStatus,
      isDemoData: item.isDemoData,
      requiredSkillsStr: item.requiredSkills.join(', '),
      preferredSkillsStr: item.preferredSkills.join(', '),
      eligibleDegreesStr: item.eligibleDegrees.join(', '),
      eligibleBranchesStr: item.eligibleBranches.join(', '),
      eligibleAcademicYearsStr: item.eligibleAcademicYears.join(', '),
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Only authorized administrators can save opportunity changes.');
      return;
    }

    if (!formData.title || !formData.organization || !formData.originalApplicationUrl) {
      alert('Title, Organization, and Original Application URL are mandatory.');
      return;
    }

    const parseList = (str: string) => str.split(',').map(s => s.trim()).filter(Boolean);

    const target: Internship = {
      id: editingInternship ? editingInternship.id : `intern-admin-${Date.now()}`,
      title: formData.title,
      organization: formData.organization,
      description: formData.description,
      department: formData.department,
      location: formData.location || 'Pan-India',
      workMode: formData.workMode,
      duration: formData.duration,
      stipend: formData.isUnpaid ? 0 : Number(formData.stipend),
      stipendCurrency: 'INR',
      isUnpaid: formData.isUnpaid,
      applicationDeadline: formData.applicationDeadline,
      originalApplicationUrl: formData.originalApplicationUrl,
      sourceName: formData.sourceName || `${formData.organization} Careers`,
      sourceType: formData.sourceType,
      verificationStatus: formData.verificationStatus,
      lastVerifiedAt: new Date().toISOString(),
      publicationStatus: formData.publicationStatus,
      isDemoData: formData.isDemoData,
      requiredSkills: parseList(formData.requiredSkillsStr),
      preferredSkills: parseList(formData.preferredSkillsStr),
      eligibleDegrees: parseList(formData.eligibleDegreesStr),
      eligibleBranches: parseList(formData.eligibleBranchesStr),
      eligibleAcademicYears: parseList(formData.eligibleAcademicYearsStr) as AcademicYear[],
      createdAt: editingInternship ? editingInternship.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveInternship(target);
    setToastMessage(editingInternship ? 'Opportunity updated successfully!' : 'New internship published!');
    resetForm();
    onRefresh();
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleVerification = async (item: Internship) => {
    if (!isAdmin) {
      alert('Admin role required.');
      return;
    }
    const updated: Internship = {
      ...item,
      verificationStatus: item.verificationStatus === 'verified' ? 'unverified' : 'verified',
      lastVerifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveInternship(updated);
    onRefresh();
  };

  const handleTogglePublication = async (item: Internship, status: PublicationStatus) => {
    if (!isAdmin) {
      alert('Admin role required.');
      return;
    }
    const updated: Internship = {
      ...item,
      publicationStatus: status,
      updatedAt: new Date().toISOString(),
    };
    await saveInternship(updated);
    onRefresh();
  };

  const handleDeleteItem = async (id: string) => {
    if (!isAdmin) {
      alert('Admin role required.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this opportunity?')) {
      await deleteInternship(id);
      onRefresh();
    }
  };

  // CSV Template Export
  const handleExportCsvTemplate = () => {
    const headers = "title,organization,description,location,workMode,duration,stipend,isUnpaid,applicationDeadline,originalApplicationUrl,sourceName,sourceType,verificationStatus,requiredSkills,preferredSkills,eligibleDegrees,eligibleBranches,eligibleAcademicYears\n";
    const sampleRow = '"Backend Engineer Intern","ScaleUp Cloud","Work on Go microservices","Bengaluru","hybrid","3 Months",25000,false,"2026-12-01","https://careers.scaleup.example","ScaleUp Careers","career_portal","verified","Go, Docker, SQL","Git, Redis","B.Tech, MCA","Computer Science","3rd Year, 4th Year"\n';
    const blob = new Blob([headers + sampleRow], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'internmatch_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import Parser
  const handleCsvUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          setCsvImportReport('CSV file is empty or missing data rows.');
          return;
        }

        let importCount = 0;
        // Parse CSV rows
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.replace(/(^"|"$)/g, '').trim());
          if (cols.length >= 10 && cols[0] && cols[1]) {
            const newRecord: Internship = {
              id: `csv-${Date.now()}-${i}`,
              title: cols[0],
              organization: cols[1],
              description: cols[2] || 'Opportunity description imported via administrative CSV ingestion.',
              location: cols[3] || 'Pan-India',
              workMode: (['remote', 'hybrid', 'on-site'].includes(cols[4]?.toLowerCase()) ? cols[4].toLowerCase() : 'remote') as WorkMode,
              duration: cols[5] || '3 Months',
              stipend: parseInt(cols[6]) || 0,
              isUnpaid: cols[7]?.toLowerCase() === 'true',
              applicationDeadline: cols[8] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              originalApplicationUrl: cols[9] || 'https://internmatch.example/apply',
              sourceName: cols[10] || 'Administrative CSV Ingestion',
              sourceType: 'career_portal',
              verificationStatus: 'verified',
              lastVerifiedAt: new Date().toISOString(),
              publicationStatus: 'published',
              isDemoData: false,
              requiredSkills: cols[12] ? cols[12].split(';').map(s => s.trim()) : ['General Aptitude'],
              preferredSkills: cols[13] ? cols[13].split(';').map(s => s.trim()) : [],
              eligibleDegrees: cols[14] ? cols[14].split(';').map(s => s.trim()) : [],
              eligibleBranches: cols[15] ? cols[15].split(';').map(s => s.trim()) : [],
              eligibleAcademicYears: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await saveInternship(newRecord);
            importCount++;
          }
        }
        setCsvImportReport(`Successfully imported and published ${importCount} opportunities!`);
        onRefresh();
      } catch (err) {
        setCsvImportReport(`CSV Parse Error: ${err instanceof Error ? err.message : 'Invalid CSV format'}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Authorization Alert if not Admin */}
      {!isAdmin && (
        <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs text-purple-900">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <p className="font-bold">Viewing Admin Portal in Read-Only Mode</p>
              <p className="text-[11px] text-purple-700">
                You are currently viewing as student <strong>{currentProfile.name}</strong>. Switch to the <strong>Admin</strong> persona using the top banner to test publishing, editing, and verifying records.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Opportunity Administration & Governance</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Publish verified openings, review data provenance, maintain eligibility constraints, and import structured listings.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { resetForm(); setShowAddForm(!showAddForm); }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Cancel Form' : 'Add Opportunity'}</span>
          </button>

          <button
            onClick={handleExportCsvTemplate}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            title="Download CSV format template"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Template</span>
          </button>

          <label className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer transition-colors">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* CSV Import Feedback Alert */}
      {csvImportReport && (
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
          <span>{csvImportReport}</span>
          <button onClick={() => setCsvImportReport(null)} className="text-indigo-600 hover:text-indigo-900 font-bold">Dismiss</button>
        </div>
      )}

      {/* Add / Edit Internship Form */}
      {showAddForm && (
        <form onSubmit={handleSubmitForm} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 animate-fadeIn">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            {editingInternship ? `Edit Opportunity: ${editingInternship.title}` : 'Publish New Internship Opportunity'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {/* Title */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Opportunity Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Frontend React Developer Intern"
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Organization */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Organization Name *</label>
              <input
                type="text"
                required
                value={formData.organization}
                onChange={e => setFormData(p => ({ ...p, organization: e.target.value }))}
                placeholder="e.g. TechFlow Solutions"
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department / Team</label>
              <input
                type="text"
                value={formData.department}
                onChange={e => setFormData(p => ({ ...p, department: e.target.value }))}
                placeholder="e.g. Web Engineering"
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                placeholder="e.g. Bengaluru / Pan-India"
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Work Mode */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Work Mode</label>
              <select
                value={formData.workMode}
                onChange={e => setFormData(p => ({ ...p, workMode: e.target.value as any }))}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="on-site">On-site</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={e => setFormData(p => ({ ...p, duration: e.target.value }))}
                placeholder="e.g. 3 Months"
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            {/* Stipend */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monthly Stipend (INR)</label>
              <input
                type="number"
                disabled={formData.isUnpaid}
                value={formData.stipend}
                onChange={e => setFormData(p => ({ ...p, stipend: Number(e.target.value) }))}
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
              <label className="flex items-center gap-1.5 mt-1 font-normal text-slate-600">
                <input
                  type="checkbox"
                  checked={formData.isUnpaid}
                  onChange={e => setFormData(p => ({ ...p, isUnpaid: e.target.checked }))}
                />
                <span>Unpaid Learning Opportunity</span>
              </label>
            </div>

            {/* Application Deadline */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application Deadline *</label>
              <input
                type="date"
                required
                value={formData.applicationDeadline}
                onChange={e => setFormData(p => ({ ...p, applicationDeadline: e.target.value }))}
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            {/* Original URL */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Original Application URL *</label>
              <input
                type="url"
                required
                value={formData.originalApplicationUrl}
                onChange={e => setFormData(p => ({ ...p, originalApplicationUrl: e.target.value }))}
                placeholder="https://company.example/careers/job"
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            {/* Source Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Source Name / Entity</label>
              <input
                type="text"
                value={formData.sourceName}
                onChange={e => setFormData(p => ({ ...p, sourceName: e.target.value }))}
                placeholder="e.g. Official Careers Portal"
                className="w-full p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            {/* Verification Status */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Verification Status</label>
              <select
                value={formData.verificationStatus}
                onChange={e => setFormData(p => ({ ...p, verificationStatus: e.target.value as any }))}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="verified">Verified (Checked Domain & Authenticity)</option>
                <option value="unverified">Unverified (Pending Review)</option>
              </select>
            </div>

            {/* Publication Status */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Publication Status</label>
              <select
                value={formData.publicationStatus}
                onChange={e => setFormData(p => ({ ...p, publicationStatus: e.target.value as any }))}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="expired">Expired</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">Full Description</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe the internship duties, mentor support, and learning outcomes..."
              className="w-full p-2.5 rounded-lg border border-slate-200"
            />
          </div>

          {/* Skills & Eligibility Requirements Strings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Required Skills (Comma-separated)</label>
              <input
                type="text"
                value={formData.requiredSkillsStr}
                onChange={e => setFormData(p => ({ ...p, requiredSkillsStr: e.target.value }))}
                placeholder="e.g. React, TypeScript, Tailwind CSS"
                className="w-full p-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Skills (Comma-separated)</label>
              <input
                type="text"
                value={formData.preferredSkillsStr}
                onChange={e => setFormData(p => ({ ...p, preferredSkillsStr: e.target.value }))}
                placeholder="e.g. Node.js, Git, Docker"
                className="w-full p-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Eligible Degrees (Comma-separated or leave blank for all)</label>
              <input
                type="text"
                value={formData.eligibleDegreesStr}
                onChange={e => setFormData(p => ({ ...p, eligibleDegreesStr: e.target.value }))}
                placeholder="e.g. B.Tech, BCA, B.Sc"
                className="w-full p-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Eligible Academic Years (Comma-separated)</label>
              <input
                type="text"
                value={formData.eligibleAcademicYearsStr}
                onChange={e => setFormData(p => ({ ...p, eligibleAcademicYearsStr: e.target.value }))}
                placeholder="e.g. 2nd Year, 3rd Year, 4th Year"
                className="w-full p-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={formData.isDemoData}
                onChange={e => setFormData(p => ({ ...p, isDemoData: e.target.checked }))}
              />
              <span>Mark visibly as [DEMO DATA]</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                {editingInternship ? 'Save Changes' : 'Publish Opportunity'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Existing Opportunities Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Managed Opportunities ({internships.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Active verification & governance audit
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Opportunity</th>
                <th className="py-3 px-4">Organization & Source</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {internships.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span>{item.title}</span>
                      {item.isDemoData && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                          DEMO
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal">
                      {item.location} • {item.workMode}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-medium text-slate-800">{item.organization}</p>
                    <p className="text-[11px] text-slate-500">{item.sourceName}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleVerification(item)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        item.verificationStatus === 'verified'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                      title="Click to toggle verification status"
                    >
                      {item.verificationStatus === 'verified' ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          <span>Unverified</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={item.publicationStatus}
                      onChange={e => handleTogglePublication(item, e.target.value as PublicationStatus)}
                      className="px-2 py-1 rounded border border-slate-200 bg-white font-medium text-[11px]"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="expired">Expired</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    {item.applicationDeadline}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                        title="Edit opportunity"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete opportunity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
