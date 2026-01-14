import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Profile as ProfileType,
  getAllProfiles,
  getActiveProfile,
  saveProfile,
  setActiveProfile,
  removeProfile,
  exportProfiles,
  importProfiles,
} from "../lib/profileStorage";

export default function Profile() {
  const [profiles, setProfiles] = useState<ProfileType[]>([]);
  const [active, setActive] = useState<ProfileType | null>(null);
  const [form, setForm] = useState<Partial<ProfileType>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setProfiles(getAllProfiles());
    setActive(getActiveProfile());
  }, []);

  useEffect(() => {
    setForm(active ?? {});
  }, [active]);

  useEffect(() => {
    console.log("[Profile] mounted", { active });
    return () => console.log("[Profile] unmounted");
  }, []);

  // autosave when user types (debounced)
  useEffect(() => {
    // only autosave when email present (use as id)
    if (!form || !form.email) {
      setAutosaveStatus('idle');
      return;
    }

    setAutosaveStatus('saving');
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const p: ProfileType = {
        id: (form.email as string).toLowerCase(),
        email: (form.email as string).toLowerCase(),
        displayName: form.displayName ?? "",
        phone: form.phone ?? "",
        avatarUrl: form.avatarUrl ?? "",
        address: form.address ?? "",
        organization: form.organization ?? "",
        role: form.role ?? "",
      };
      try {
        saveProfile(p);
        setActiveProfile(p.id);
        refresh();
        setAutosaveStatus('saved');
        setLastSavedAt(new Date());
        setTimeout(() => setAutosaveStatus('idle'), 1400);
      } catch {
        setMsg("Autosave failed");
        setTimeout(() => setMsg(null), 1600);
        setAutosaveStatus('idle');
      }
    }, 800);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [form]);

  const refresh = () => {
    setProfiles(getAllProfiles());
    setActive(getActiveProfile());
  };

  const handleSave = () => {
    if (!form?.email) return setMsg("Email is required");
    const p: ProfileType = {
      id: (form.email as string).toLowerCase(),
      email: (form.email as string).toLowerCase(),
      displayName: form.displayName ?? "",
      phone: form.phone ?? "",
      avatarUrl: form.avatarUrl ?? "",
      address: form.address ?? "",
      organization: form.organization ?? "",
      role: form.role ?? "",
    };
    saveProfile(p);
    setMsg("Profile saved");
    setTimeout(() => setMsg(null), 1800);
    refresh();
  };

  const handleDelete = () => {
    if (!active) return;
    removeProfile(active.id);
    setMsg("Profile removed");
    setTimeout(() => setMsg(null), 1600);
    refresh();
  };

  const handleNew = () => {
    setActive(null);
    setForm({});
  };

  const handleSelect = (id: string) => {
    setActive(getAllProfiles().find((p) => p.id === id) ?? null);
    setActiveProfile(id);
    refresh();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const txt = await f.text();
    try {
      importProfiles(txt);
      setMsg("Profiles imported");
      refresh();
    } catch {
      setMsg("Import failed");
    }
    setTimeout(() => setMsg(null), 1600);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Profile</h2>
        <div className="flex items-center gap-3">
          <select
            value={active?.id ?? ""}
            onChange={(e) => handleSelect(e.target.value)}
            className="bg-white/5 text-white p-2 rounded"
          >
            <option value="">Select profile</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.displayName || p.email}</option>
            ))}
          </select>
          <button onClick={handleNew} className="px-3 py-2 rounded bg-white/6">New</button>
          <label className="px-3 py-2 rounded bg-white/6 cursor-pointer">
            Import
            <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
          </label>
          <a className="px-3 py-2 rounded bg-white/6" href={`data:application/json,${encodeURIComponent(exportProfiles())}`} download="profiles.json">Export</a>
        </div>
      </div>

      <div className="bg-white/5 p-6 rounded-xl text-white/90">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="w-28 h-28 rounded-full bg-white/6 overflow-hidden mb-3">
              {form?.avatarUrl ? <img src={form.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/10 flex items-center justify-center">NO</div>}
            </div>
            <div className="text-sm text-white/70 mb-2">Active: {active?.email ?? '—'}</div>
            <div className="text-sm text-white/70">Profiles: {profiles.length}</div>
          </div>

          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={form.displayName ?? ""} onChange={(e) => setForm((s) => ({ ...s, displayName: e.target.value }))} placeholder="Full name" className="p-3 rounded bg-white/6" />
              <input value={form.email ?? ""} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} placeholder="Email" className="p-3 rounded bg-white/6" />
              <input value={form.phone ?? ""} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} placeholder="Phone" className="p-3 rounded bg-white/6" />
              <input value={form.avatarUrl ?? ""} onChange={(e) => setForm((s) => ({ ...s, avatarUrl: e.target.value }))} placeholder="Avatar URL" className="p-3 rounded bg-white/6" />
              <input value={form.address ?? ""} onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} placeholder="Address" className="p-3 rounded bg-white/6 md:col-span-2" />
              <input value={form.organization ?? ""} onChange={(e) => setForm((s) => ({ ...s, organization: e.target.value }))} placeholder="Organization" className="p-3 rounded bg-white/6" />
              <input value={form.role ?? ""} onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))} placeholder="Role" className="p-3 rounded bg-white/6" />
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button onClick={handleSave} className="px-4 py-2 rounded bg-linear-to-r from-blue-600 to-purple-600">Save</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded bg-white/6">Delete</button>
              <button onClick={refresh} className="px-3 py-2 rounded bg-white/6">Refresh</button>

              {/* autosave indicator */}
              <div className="ml-3">
                {autosaveStatus === 'saving' && <div className="text-sm text-white/70">Saving…</div>}
                {autosaveStatus === 'saved' && lastSavedAt && (
                  <div className="text-sm text-green-400">Autosaved {lastSavedAt.toLocaleTimeString()}</div>
                )}
                {autosaveStatus === 'idle' && lastSavedAt && (
                  <div className="text-sm text-white/70">Last saved {lastSavedAt.toLocaleTimeString()}</div>
                )}
                {msg && <div className="text-sm text-white/70 mt-1">{msg}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
