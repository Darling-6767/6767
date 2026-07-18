import type { UserData, Language } from '../types';
import { MAX_HEARTS, REGEN_INTERVAL_MS } from '../types';

const USERS_KEY = 'lang_app_users';
const CURRENT_USER_KEY = 'lang_app_current_user';

export function getUsers(): Record<string, UserData> {
  try { const raw = localStorage.getItem(USERS_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
export function saveUsers(users: Record<string, UserData>) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
export function getUser(email: string): UserData | null { const users = getUsers(); return users[email] || null; }
export function saveUser(user: UserData) { const users = getUsers(); users[user.email] = user; saveUsers(users); }
export function getCurrentUser(): UserData | null { const email = localStorage.getItem(CURRENT_USER_KEY); if (!email) return null; return getUser(email); }
export function setCurrentUser(email: string) { localStorage.setItem(CURRENT_USER_KEY, email); }
export function logout() { localStorage.removeItem(CURRENT_USER_KEY); }
export function updateProgress(language: Language, level: number) { const user = getCurrentUser(); if (!user) return; const prev = user.progress[language] || 0; if (level > prev) { user.progress[language] = level; saveUser(user); } }
export function getProgress(language: Language): number { const user = getCurrentUser(); if (!user) return 0; return user.progress[language] || 0; }
export function addPoints(amount: number) { const user = getCurrentUser(); if (!user) return; user.points += amount; saveUser(user); }
export function spendPoints(amount: number): boolean { const user = getCurrentUser(); if (!user || user.points < amount) return false; user.points -= amount; saveUser(user); return true; }
export function addHearts(amount: number) { const user = getCurrentUser(); if (!user) return; user.hearts = Math.min(user.hearts + amount, MAX_HEARTS); saveUser(user); }
export function spendHeart(): boolean { const user = getCurrentUser(); if (!user || user.hearts <= 0) return false; user.hearts -= 1; saveUser(user); return true; }
export function updateProfile(data: Partial<Pick<UserData, 'nickname' | 'avatar'>>) { const user = getCurrentUser(); if (!user) return; if (data.nickname !== undefined) user.nickname = data.nickname; if (data.avatar !== undefined) user.avatar = data.avatar; saveUser(user); }

export function regenHearts(): number {
  const user = getCurrentUser();
  if (!user) return 0;
  if (user.hearts >= MAX_HEARTS) { user.lastHeartRegen = Date.now(); saveUser(user); return 0; }
  const now = Date.now();
  const last = user.lastHeartRegen || now;
  const elapsed = now - last;
  const recover = Math.floor(elapsed / REGEN_INTERVAL_MS);
  if (recover <= 0) return 0;
  const newHearts = Math.min(user.hearts + recover, MAX_HEARTS);
  const gained = newHearts - user.hearts;
  user.hearts = newHearts;
  user.lastHeartRegen = last + recover * REGEN_INTERVAL_MS;
  saveUser(user);
  return gained;
}
export function getNextHeartMs(): number {
  const user = getCurrentUser();
  if (!user || user.hearts >= MAX_HEARTS) return 0;
  const now = Date.now();
  const nextTime = (user.lastHeartRegen || now) + REGEN_INTERVAL_MS;
  return Math.max(0, nextTime - now);
}