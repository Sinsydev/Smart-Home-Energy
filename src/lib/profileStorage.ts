export const PROFILES_KEY = "kscsirs_profiles_v1";
export const ACTIVE_KEY = "kscsirs_active_profile_v1";

export type Profile = {
  id: string; // use email as id when available
  email: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  address?: string;
  organization?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
};

const safeParse = (s: string | null) => {
  try {
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
};

export function getProfilesMap(): Record<string, Profile> {
  const raw = safeParse(localStorage.getItem(PROFILES_KEY));
  return raw && typeof raw === "object" ? raw : {};
}

export function getAllProfiles(): Profile[] {
  return Object.values(getProfilesMap());
}

export function getProfile(id: string): Profile | null {
  return getProfilesMap()[id] ?? null;
}

export function saveProfile(profile: Profile) {
  if (!profile.email) throw new Error("Profile must have an email");
  const id = profile.id ?? profile.email;
  const now = new Date().toISOString();
  const existing = getProfile(id);
  const toSave: Profile = { ...profile, id, createdAt: existing?.createdAt ?? now, updatedAt: now };
  const map = getProfilesMap();
  map[id] = toSave;
  localStorage.setItem(PROFILES_KEY, JSON.stringify(map));
  // set active if no active yet
  if (!getActiveProfile()) setActiveProfile(id);
  return toSave;
}

export function removeProfile(id: string) {
  const map = getProfilesMap();
  delete map[id];
  localStorage.setItem(PROFILES_KEY, JSON.stringify(map));
  const active = getActiveProfileId();
  if (active === id) {
    const keys = Object.keys(map);
    setActiveProfile(keys[0] ?? null);
  }
}

export function setActiveProfile(id: string | null) {
  if (id === null) {
    localStorage.removeItem(ACTIVE_KEY);
    return;
  }
  localStorage.setItem(ACTIVE_KEY, id);
}

export function getActiveProfileId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function getActiveProfile(): Profile | null {
  const id = getActiveProfileId();
  if (!id) return null;
  return getProfile(id);
}

export function exportProfiles(): string {
  return JSON.stringify(getProfilesMap(), null, 2);
}

export function importProfiles(json: string) {
  const parsed = safeParse(json);
  if (!parsed || typeof parsed !== "object") throw new Error("Invalid JSON");
  localStorage.setItem(PROFILES_KEY, JSON.stringify(parsed));
}
