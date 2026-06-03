import { useState } from 'react';
import Icon from '@/components/ui/icon';

const ADMIN_URL_KEY = 'angela_admin_key';
const AUTH_URL = 'https://functions.poehali.dev/126ea50d-7c26-45ab-ba81-cf8c76bf2dc8';

interface User {
  id: number;
  nickname: string;
  is_vip: boolean;
  is_vip_active: boolean;
  vip_expires_at: string | null;
  created_at: string;
  active_sessions: number;
}

async function adminRequest(url: string, adminKey: string, options?: RequestInit) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey, ...(options?.headers || {}) },
    });
    const text = await res.text();
    try {
      return { _status: res.status, ...JSON.parse(text) };
    } catch {
      return { _status: res.status, _raw: text };
    }
  } catch (e: unknown) {
    return { _networkError: e instanceof Error ? e.message : String(e) };
  }
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem(ADMIN_URL_KEY) || '');
  const [keyInput, setKeyInput] = useState('');
  const [authed, setAuthed] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [days, setDays] = useState(30);
  const [search, setSearch] = useState('');
  const adminUrl = AUTH_URL;

  const showMsg = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  const login = async () => {
    if (!keyInput.trim()) return;
    setLoading(true);
    const data = await adminRequest(adminUrl, keyInput.trim(), {
      method: 'POST', body: JSON.stringify({ action: 'admin_list' }),
    });
    setLoading(false);
    if (data._networkError) {
      showMsg(`Ошибка сети: ${data._networkError}`, false);
    } else if (data._status === 403) {
      showMsg('Неверный пароль. Проверь секрет ADMIN_KEY.', false);
    } else if (data._status && data._status !== 200) {
      showMsg(`Ошибка сервера: ${data._status}. ${data.error || data._raw || ''}`, false);
    } else if (data.users) {
      localStorage.setItem(ADMIN_URL_KEY, keyInput.trim());
      setAdminKey(keyInput.trim());
      setUsers(data.users);
      setAuthed(true);
    } else {
      showMsg(`Неожиданный ответ: ${JSON.stringify(data)}`, false);
    }
  };

  const loadUsers = async () => {
    if (!adminUrl || !adminKey) return;
    setLoading(true);
    const data = await adminRequest(adminUrl, adminKey, {
      method: 'POST', body: JSON.stringify({ action: 'admin_list' }),
    });
    setLoading(false);
    if (data.users) setUsers(data.users);
  };

  const grantVip = async (nickname: string) => {
    setActionLoading(nickname + '_grant');
    const data = await adminRequest(adminUrl, adminKey, {
      method: 'POST',
      body: JSON.stringify({ action: 'admin_grant_vip', nickname, days }),
    });
    setActionLoading(null);
    if (data.success) {
      showMsg(data.message, true);
      loadUsers();
    } else {
      showMsg(data.error || 'Ошибка', false);
    }
  };

  const revokeVip = async (nickname: string) => {
    setActionLoading(nickname + '_revoke');
    const data = await adminRequest(adminUrl, adminKey, {
      method: 'POST',
      body: JSON.stringify({ action: 'admin_revoke_vip', nickname }),
    });
    setActionLoading(null);
    if (data.success) {
      showMsg(data.message, true);
      loadUsers();
    } else {
      showMsg(data.error || 'Ошибка', false);
    }
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_URL_KEY);
    setAdminKey('');
    setAuthed(false);
    setUsers([]);
  };

  const filtered = users.filter(u => u.nickname.toLowerCase().includes(search.toLowerCase()));

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name="ShieldCheck" size={16} className="text-primary" />
              </div>
              <div>
                <div className="font-display text-sm font-bold text-foreground tracking-widest">ADMIN</div>
                <div className="text-[10px] text-muted-foreground font-body">Angela Football Analyst</div>
              </div>
            </div>
            <input
              type="password"
              placeholder="Введи секретный ключ"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              className="bg-background border border-border rounded-xl px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
            {msg && (
              <div className={`text-xs font-body px-3 py-2 rounded-lg ${msg.ok ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                {msg.text}
              </div>
            )}
            <button
              onClick={login}
              disabled={loading || !keyInput.trim()}
              className="bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold font-body hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="ShieldCheck" size={16} className="text-primary" />
          </div>
          <div>
            <div className="font-display text-sm font-bold text-foreground tracking-widest">ADMIN PANEL</div>
            <div className="text-[10px] text-muted-foreground font-body">{users.length} пользователей</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadUsers} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
            <Icon name="RefreshCw" size={14} />
          </button>
          <button onClick={logout} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all">
            <Icon name="LogOut" size={14} />
          </button>
        </div>
      </div>

      {/* Message */}
      {msg && (
        <div className={`mb-4 text-sm font-body px-4 py-3 rounded-xl border ${msg.ok ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
          {msg.text}
        </div>
      )}

      {/* VIP days selector */}
      <div className="bg-card border border-border rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
        <Icon name="Crown" size={14} className="text-yellow-400 flex-shrink-0" />
        <span className="text-xs text-muted-foreground font-body">Срок VIP при активации:</span>
        {[7, 30, 90, 365].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`text-xs font-body px-2.5 py-1 rounded-lg border transition-all ${days === d ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400 font-bold' : 'border-border text-muted-foreground hover:border-yellow-500/30'}`}
          >
            {d === 365 ? '1 год' : `${d} дн`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Поиск по никнейму..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Users list */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="text-center text-sm text-muted-foreground font-body py-8">
            {search ? 'Пользователь не найден' : 'Нет пользователей'}
          </div>
        )}
        {filtered.map(u => {
          const isExpired = u.vip_expires_at && new Date(u.vip_expires_at) < new Date();
          const expiresLabel = u.vip_expires_at
            ? new Date(u.vip_expires_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
            : null;

          return (
            <div key={u.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon name="User" size={16} className="text-primary" />
                </div>
                {u.is_vip_active && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Icon name="Crown" size={8} className="text-black" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold font-body text-foreground">{u.nickname}</span>
                  {u.is_vip_active && (
                    <span className="text-[10px] font-bold font-body text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded-md">VIP</span>
                  )}
                  {u.is_vip && isExpired && (
                    <span className="text-[10px] font-bold font-body text-muted-foreground bg-muted/20 border border-border px-1.5 py-0.5 rounded-md">истёк</span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground font-body mt-0.5">
                  {u.is_vip_active && expiresLabel ? `до ${expiresLabel}` : `с ${new Date(u.created_at).toLocaleDateString('ru-RU')}`}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {u.is_vip_active ? (
                  <button
                    onClick={() => revokeVip(u.nickname)}
                    disabled={actionLoading === u.nickname + '_revoke'}
                    className="text-[11px] font-body px-2.5 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
                  >
                    {actionLoading === u.nickname + '_revoke' ? '...' : 'Снять VIP'}
                  </button>
                ) : (
                  <button
                    onClick={() => grantVip(u.nickname)}
                    disabled={actionLoading === u.nickname + '_grant'}
                    className="text-[11px] font-body px-2.5 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    <Icon name="Crown" size={11} />
                    {actionLoading === u.nickname + '_grant' ? '...' : `VIP ${days}д`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}