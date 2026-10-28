"use client";

export type Profile = { id: string; name: string };

const KEY = "cmw:profile";

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `p-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export function getProfile(): Profile {
  if (typeof window === "undefined") return { id: "server", name: "Studio Artist" };
  const raw = window.localStorage.getItem(KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Profile;
      if (parsed?.id) return { id: parsed.id, name: parsed.name || "Studio Artist" };
    } catch {
      /* fall through and regenerate */
    }
  }
  const profile: Profile = { id: uuid(), name: "Studio Artist" };
  window.localStorage.setItem(KEY, JSON.stringify(profile));
  return profile;
}

export function setProfileName(name: string) {
  const profile = { ...getProfile(), name: name.trim().slice(0, 28) || "Studio Artist" };
  window.localStorage.setItem(KEY, JSON.stringify(profile));
  return profile;
}
