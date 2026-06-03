import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { logout } from '@/lib/auth';
import { apiOwnerList, apiOwnerGrantVip, apiOwnerRevokeVip } from '@/lib/api';

const ANGELA_AVATAR = 'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/bucket/5884d2d4-4821-4d6c-9720-09b91b15dde1.jpeg';
const OWNER_NICKNAME = 'creator';

interface User {
  id: number;
  nickname: string;
  is_vip_active: boolean;
  vip_expires_at: string | null;
  created_at: string;
}

interface Props {
  nickname: string;
  isVip: boolean;
  onLogout: () => void;
  onGoVip: () => void;
  onGoHotForecasts: () => void;
}

function OwnerPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [days, setDays] = useState(30);
  const [search, setSearch] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await apiOwnerList();
    setLoading(false);
    if (data.users) setUsers(data.users);
  };

  const showMsg = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const grantVip = async (nickname: string) => {
    setActionLoading(nickname + '_grant');
    const data = await apiOwnerGrantVip(nickname, days);
    setActionLoading(null);
    if (data.success) { showMsg(data.message, true); loadUsers(); }
    else showMsg(data.error || 'Ошибка', false);
  };

  const revokeVip = async (nickname: string) => {
    setActionLoading(nickname + '_revoke');
    const data = await apiOwnerRevokeVip(nickname);
    setActionLoading(null);
    if (data.success) { showMsg(data.message, true); loadUsers(); }
    else showMsg(data.error || 'Ошибка', false);
  };

  const filtered = users.filter(u => u.nickname.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-card border border-primary/20 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-primary/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="ShieldCheck" size={14} className="text-primary" />
          <span className="font-display text-xs font-bold text-foreground tracking-wider">УПРАВЛЕНИЕ VIP</span>
        </div>
        <button onClick={loadUsers} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="RefreshCw" size={12} />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Msg */}
        {msg && (
          <div className={`text-xs font-body px-3 py-2 rounded-lg ${msg.ok ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
            {msg.text}
          </div>
        )}

        {/* Days */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-body">Срок:</span>
          {[7, 30, 90, 365].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`text-[10px] font-body px-2 py-1 rounded-lg border transition-all ${days === d ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400 font-bold' : 'border-border text-muted-foreground'}`}>
              {d === 365 ? '1г' : `${d}д`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Icon name="Search" size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-7 pr-3 py-1.5 text-xs font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" />
        </div>

        {/* Users */}
        {loading ? (
          <div className="text-center text-xs text-muted-foreground font-body py-4">Загрузка...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground font-body py-4">Нет пользователей</div>
        ) : (
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {filtered.map(u => (
              <div key={u.id} className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold font-body text-foreground truncate">{u.nickname}</span>
                    {u.is_vip_active && (
                      <span className="text-[9px] font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-1 py-0.5 rounded flex-shrink-0">VIP</span>
                    )}
                  </div>
                  {u.vip_expires_at && u.is_vip_active && (
                    <div className="text-[9px] text-muted-foreground font-body">
                      до {new Date(u.vip_expires_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </div>
                  )}
                </div>
                {u.is_vip_active ? (
                  <button onClick={() => revokeVip(u.nickname)}
                    disabled={actionLoading === u.nickname + '_revoke'}
                    className="text-[10px] font-body px-2 py-1 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50 flex-shrink-0">
                    {actionLoading === u.nickname + '_revoke' ? '...' : 'Снять'}
                  </button>
                ) : (
                  <button onClick={() => grantVip(u.nickname)}
                    disabled={actionLoading === u.nickname + '_grant'}
                    className="text-[10px] font-body px-2 py-1 rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-all disabled:opacity-50 flex-shrink-0 flex items-center gap-1">
                    <Icon name="Crown" size={10} />
                    {actionLoading === u.nickname + '_grant' ? '...' : `VIP`}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage({ nickname, isVip, onLogout, onGoVip, onGoHotForecasts }: Props) {
  const isOwner = nickname === OWNER_NICKNAME;

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">ПРОФИЛЬ</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Личный кабинет</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* User card */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <Icon name="User" size={24} className="text-primary" />
              </div>
              {isVip && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Icon name="Crown" size={10} className="text-black" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="font-display text-xl font-bold text-foreground tracking-wide">{nickname}</div>
              <div className={`flex items-center gap-1.5 mt-0.5 text-xs font-body font-semibold ${isVip ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                {isVip ? (
                  <><Icon name="Crown" size={12} />VIP участник</>
                ) : (
                  <><Icon name="User" size={12} />Стандартный аккаунт</>
                )}
              </div>
            </div>
          </div>

          {!isVip && (
            <button
              onClick={onGoVip}
              className="mt-4 w-full py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold font-body flex items-center justify-center gap-2 hover:bg-yellow-500/15 transition-colors"
            >
              <Icon name="Crown" size={14} />
              Получить VIP за 1 200 ₽/мес
            </button>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <div className="text-xs font-display font-semibold text-foreground tracking-wider">БЫСТРЫЙ ДОСТУП</div>
          </div>

          <button
            onClick={onGoHotForecasts}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/30 transition-colors border-b border-border/50 text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <span className="text-base">🔥</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold font-body text-foreground">Горячие прогнозы</div>
              <div className="text-[10px] text-muted-foreground font-body">{isVip ? 'Все прогнозы открыты' : '3 прогноза в сутки'}</div>
            </div>
            <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
          </button>

          <button
            onClick={onGoVip}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/30 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
              <Icon name="Crown" size={14} className="text-yellow-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold font-body text-foreground">VIP подписка</div>
              <div className="text-[10px] text-muted-foreground font-body">{isVip ? 'Активна' : '1 200 ₽/месяц'}</div>
            </div>
            <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
          </button>
        </div>

        {/* Owner VIP panel */}
        {isOwner && <OwnerPanel />}

        {/* Angela message */}
        <div className="flex items-start gap-3 bg-card border border-primary/15 rounded-xl p-4">
          <img
            src={ANGELA_AVATAR}
            alt="Анжела"
            className="w-9 h-9 rounded-full object-cover object-top flex-shrink-0"
          />
          <div>
            <div className="text-xs font-semibold text-primary font-body mb-1">Анжела:</div>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              Привет, <span className="text-foreground font-semibold">{nickname}</span>! Рада видеть тебя. Перейди в чат — задай любой вопрос о футболе, и я разберу его детально.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Дней с нами', value: '1', icon: 'Calendar' },
            { label: 'Прогнозов', value: isVip ? '∞' : '3', icon: 'TrendingUp' },
            { label: 'Статус', value: isVip ? 'VIP' : 'FREE', icon: 'Award' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
              <Icon name={s.icon} size={16} className={`mx-auto mb-1 ${s.label === 'Статус' && isVip ? 'text-yellow-400' : 'text-muted-foreground'}`} />
              <div className={`font-display text-lg font-bold ${s.label === 'Статус' && isVip ? 'text-yellow-400' : 'text-foreground'}`}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground font-body">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-destructive/40 hover:text-destructive transition-all font-body text-sm"
        >
          <Icon name="LogOut" size={14} />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}