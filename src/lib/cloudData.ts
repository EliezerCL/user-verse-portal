import { supabase } from "@/integrations/supabase/client";

export type Profile = { id: string; name: string; username: string; photo: string | null };

// ============= Logo (tabela app_settings, linha única id=1) =============
let logoCache: string | null | undefined;
const logoListeners = new Set<() => void>();

export async function fetchLogo(force = false): Promise<string | null> {
  if (logoCache !== undefined && !force) return logoCache;
  const { data } = await supabase
    .from("app_settings")
    .select("logo")
    .eq("id", 1)
    .maybeSingle();
  logoCache = data?.logo ?? null;
  logoListeners.forEach((l) => l());
  return logoCache;
}

export function useLogo(): string | null | undefined {
  const [logo, setLogo] = useState<string | null | undefined>(logoCache);
  useEffect(() => {
    if (logoCache === undefined) fetchLogo();
    const l = () => setLogo(logoCache);
    logoListeners.add(l);
    l();
    return () => {
      logoListeners.delete(l);
    };
  }, []);
  return logo;
}

export async function saveLogo(value: string | null): Promise<void> {
  const { error } = await supabase
    .from("app_settings")
    .update({ logo: value, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw error;
  logoCache = value;
  logoListeners.forEach((l) => l());
}

// ============= Perfil do usuário logado (tabela profiles) =============
let profileCache: Profile | null | undefined;
let profileUserId: string | undefined;
const profileListeners = new Set<() => void>();

export async function fetchProfile(userId: string, force = false): Promise<Profile | null> {
  if (profileCache !== undefined && profileUserId === userId && !force) return profileCache;
  const { data } = await supabase
    .from("profiles")
    .select("id, name, username, photo")
    .eq("id", userId)
    .maybeSingle();
  profileCache = data ?? null;
  profileUserId = userId;
  profileListeners.forEach((l) => l());
  return profileCache;
}

export function useProfile(): Profile | null | undefined {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    const l = () => setProfile(profileCache ?? null);
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      const uid = data.session?.user.id;
      if (!uid) return;
      profileListeners.add(l);
      l();
      if (profileCache === undefined || profileUserId !== uid) fetchProfile(uid);
    });
    return () => {
      cancelled = true;
      profileListeners.delete(l);
    };
  }, []);
  return profile;
}

export async function saveProfile(
  userId: string,
  patch: Partial<Pick<Profile, "name" | "username" | "photo">>,
): Promise<void> {
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw error;
  if (profileCache && profileUserId === userId) {
    profileCache = { ...profileCache, ...patch };
  } else {
    profileCache = profileCache ? { ...profileCache, ...patch } : profileCache;
  }
  profileListeners.forEach((l) => l());
}
