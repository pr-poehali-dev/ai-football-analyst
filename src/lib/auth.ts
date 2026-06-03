export interface User {
  nickname: string;
  is_vip: boolean;
  token: string;
}

export function saveUser(user: User) {
  localStorage.setItem('angela_token', user.token);
  localStorage.setItem('angela_user', JSON.stringify(user));
}

export function loadUser(): User | null {
  try {
    const raw = localStorage.getItem('angela_user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem('angela_token');
  localStorage.removeItem('angela_user');
}

export function updateUser(patch: Partial<User>) {
  const u = loadUser();
  if (u) saveUser({ ...u, ...patch });
}
