import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import type { StudentProfile, AcademicYear, SkillProficiency, WorkMode } from '../types';
import { saveCurrentProfile } from '../lib/storage';
import { 
  User, 
  BookOpen, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  MapPin, 
  Briefcase, 
  IndianRupee
} from 'lucide-react';

interface ProfileViewProps {
  initialProfile: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
}

export const ProfileView: FC<ProfileViewProps> = ({
  initialProfile,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState<SkillProficiency>('Intermediate');
  const [newInterest, setNewInterest] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!profile.name.trim()) errs.name = 'Full name is required.';
    if (!profile.degree.trim()) errs.degree = 'Degree is required for eligibility matching.';
    if (!profile.academicYear) errs.academicYear = 'Current academic year is required.';
    if (profile.skills.length === 0) errs.skills = 'Please add at least one skill for matching.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const updated: StudentProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    saveCurrentProfile(updated);
    onProfileUpdated(updated);
    setSaveToast('Profile successfully saved! Matching recommendations updated.');
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Skill management
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const exists = profile.skills.some(
      s => s.name.toLowerCase() === newSkillName.trim().toLowerCase()
    );
    if (!exists) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, { name: newSkillName.trim(), proficiency: newSkillProficiency }]
      }));
      setNewSkillName('');
    }
  };

  const handleRemoveSkill = (skillName: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.name !== skillName)
    }));
  };

  // Interest management
  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    if (!profile.interests.includes(newInterest.trim())) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (item: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== item)
    }));
  };

  // Location management
  const handleAddLocation = () => {
    if (!newLocation.trim()) return;
    if (!profile.preferredLocations.includes(newLocation.trim())) {
      setProfile(prev => ({
        ...prev,
        preferredLocations: [...prev.preferredLocations, newLocation.trim()]
      }));
      setNewLocation('');
    }
  };

  const handleRemoveLocation = (loc: string) => {
    setProfile(prev => ({
      ...prev,
      preferredLocations: prev.preferredLocations.filter(l => l !== loc)
    }));
  };

  // Toggle work mode
  const handleToggleWorkMode = (mode: WorkMode) => {
    setProfile(prev => {
      const current = prev.workModePreference || [];
      const updated = current.includes(mode)
        ? current.filter(m => m !== mode)
        : [...current, mode];
      return { ...prev, workModePreference: updated };
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast notification */}
      {saveToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            <span>{saveToast}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <User className="w-5 h-5 text-indigo-600" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Profile</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Keep your skills, course, and preferences updated. The deterministic matching engine calculates opportunity compatibility from these verified fields.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Basic & Academic Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Basic & Academic Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full p-2.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
                placeholder="e.g. Priya Sharma"
              />
              {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
            </div>

            {/* Email (Readonly) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email (Authenticated)</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-xs cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400">Linked to authentication system</span>
            </div>

            {/* Degree */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Degree / Course</label>
              <select
                value={profile.degree}
                onChange={e => setProfile(prev => ({ ...prev, degree: e.target.value }))}
                className={`w-full p-2.5 rounded-lg border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.degree ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                }`}
              >
                <option value="">Select Degree</option>
                <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                <option value="MCA">MCA (Master of Computer Applications)</option>
                <option value="M.Tech">M.Tech (Master of Technology)</option>
                <option value="B.Des">B.Des (Bachelor of Design)</option>
                <option value="BBA">BBA (Bachelor of Business Administration)</option>
              </select>
              {errors.degree && <p className="text-[11px] text-rose-600 mt-1">{errors.degree}</p>}
            </div>

            {/* Branch / Specialization */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Branch / Specialization</label>
              <input
                type="text"
                value={profile.branch}
                onChange={e => setProfile(prev => ({ ...prev, branch: e.target.value }))}
                placeholder="e.g. Computer Science, Data Science, IT"
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Academic Year */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Current Academic Year</label>
              <div className="flex flex-wrap gap-2">
                {(['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Postgraduate'] as AcademicYear[]).map(yr => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setProfile(prev => ({ ...prev, academicYear: yr }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      profile.academicYear === yr
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Skills & Proficiency */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Technical & Soft Skills (50% Match Weight)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add skills you know along with your current proficiency level.
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
              {profile.skills.length} skills listed
            </span>
          </div>

          {/* Add skill input row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Enter skill name (e.g. React, Python, PostgreSQL, Figma, Docker)..."
              value={newSkillName}
              onChange={e => setNewSkillName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }}}
              className="flex-1 p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <select
              value={newSkillProficiency}
              onChange={e => setNewSkillProficiency(e.target.value as SkillProficiency)}
              className="p-2.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>

          {/* Skill Pills List */}
          <div className="flex flex-wrap gap-2 pt-2">
            {profile.skills.map(sk => (
              <span
                key={sk.name}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
              >
                <span>{sk.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  sk.proficiency === 'Advanced' ? 'bg-emerald-100 text-emerald-800' :
                  sk.proficiency === 'Intermediate' ? 'bg-indigo-100 text-indigo-800' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {sk.proficiency}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(sk.name)}
                  className="text-slate-400 hover:text-rose-600"
                  aria-label={`Remove ${sk.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          {errors.skills && <p className="text-[11px] text-rose-600 mt-1">{errors.skills}</p>}
        </div>

        {/* Section 3: Preferences (Location, Work Mode, Duration, Stipend) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-indigo-600" />
            Preferences & Targets
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            {/* Work Mode Preferences */}
            <div>
              <label className="block font-semibold text-slate-700 mb-2">Work Mode Preferences</label>
              <div className="space-y-2">
                {(['remote', 'hybrid', 'on-site'] as WorkMode[]).map(mode => {
                  const checked = profile.workModePreference.includes(mode);
                  return (
                    <label key={mode} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 capitalize">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleWorkMode(mode)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{mode} Opportunities</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Minimum Stipend */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                Minimum Stipend Expectation
              </label>
              <select
                value={profile.minStipendPreference}
                onChange={e => setProfile(prev => ({ ...prev, minStipendPreference: Number(e.target.value) }))}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="0">₹0 / Open to Unpaid Learning Internships</option>
                <option value="5000">₹5,000+ / month</option>
                <option value="10000">₹10,000+ / month</option>
                <option value="15000">₹15,000+ / month</option>
                <option value="20000">₹20,000+ / month</option>
                <option value="30000">₹30,000+ / month</option>
              </select>
            </div>

            {/* Preferred Duration */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Internship Duration</label>
              <select
                value={profile.preferredDuration}
                onChange={e => setProfile(prev => ({ ...prev, preferredDuration: e.target.value }))}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1-2 months">1-2 Months (Summer / Winter Break)</option>
                <option value="3-6 months">3-6 Months (Semester Internship)</option>
                <option value="6+ months">6+ Months (Long-term / Co-op)</option>
              </select>
            </div>

            {/* Preferred Locations */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Locations</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. Bengaluru, Remote, Mumbai..."
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddLocation(); }}}
                  className="flex-1 p-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddLocation}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.preferredLocations.map(loc => (
                  <span key={loc} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] flex items-center gap-1">
                    {loc}
                    <button type="button" onClick={() => handleRemoveLocation(loc)} className="text-slate-400 hover:text-rose-600">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Interests & Target Roles */}
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Interests & Target Roles (15% Match Weight)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. Frontend Development, Machine Learning, Cloud DevOps, Product Design..."
                  value={newInterest}
                  onChange={e => setNewInterest(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddInterest(); }}}
                  className="flex-1 p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddInterest}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold"
                >
                  Add Interest
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.interests.map(intr => (
                  <span key={intr} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs flex items-center gap-1.5 font-medium">
                    {intr}
                    <button type="button" onClick={() => handleRemoveInterest(intr)} className="text-indigo-400 hover:text-indigo-900 font-bold">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm hover:bg-indigo-700 shadow-md shadow-indigo-100 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" /> Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};
