import { useState, useEffect } from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import Icon from '@/components/ui/icon';
import ChatPage from '@/pages/ChatPage';
import MatchesPage from '@/pages/MatchesPage';
import TeamsPage from '@/pages/TeamsPage';
import StatsPage from '@/pages/StatsPage';
import ForecastPage from '@/pages/ForecastPage';
import CalendarPage from '@/pages/CalendarPage';
import AuthPage from '@/pages/AuthPage';
import ProfilePage from '@/pages/ProfilePage';
import HotForecastsPage from '@/pages/HotForecastsPage';
import VipPage from '@/pages/VipPage';
import AdminPage from '@/pages/AdminPage';
import DonatePage from '@/pages/DonatePage';
import { loadUser } from '@/lib/auth';

const ANGELA_AVATAR = 'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/files/b3cba21b-b8b7-4945-9402-017eb6079f89.jpg';

type Tab = 'chat' | 'matches' | 'teams' | 'stats' | 'forecast' | 'calendar' | 'hot' | 'profile' | 'vip' | 'donate';

const MAIN_TABS: { id: Tab; label: string; icon: string; short: string }[] = [
  { id: 'chat',     label: 'Чат',        icon: 'MessageCircle', short: 'Чат' },
  { id: 'matches',  label: 'Матчи',      icon: 'Activity',      short: 'Матчи' },
  { id: 'teams',    label: 'Команды',    icon: 'Shield',        short: 'Команды' },
  { id: 'stats',    label: 'Статистика', icon: 'BarChart2',     short: 'Стат' },
  { id: 'forecast', label: 'Прогнозы',   icon: 'TrendingUp',    short: 'Прогнозы' },
  { id: 'calendar', label: 'Календарь',  icon: 'Calendar',      short: 'Кал' },
];

function FootballBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dark radial gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-[hsl(142,20%,4%)]" />
      {/* Subtle pitch lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
        {/* Center circle */}
        <ellipse cx="50%" cy="50%" rx="120" ry="100" fill="none" stroke="#4ade80" strokeWidth="1.5" />
        <circle cx="50%" cy="50%" r="5" fill="#4ade80" />
        {/* Halfway line */}
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#4ade80" strokeWidth="1" />
        {/* Penalty boxes */}
        <rect x="5%" y="25%" width="15%" height="50%" fill="none" stroke="#4ade80" strokeWidth="1" />
        <rect x="80%" y="25%" width="15%" height="50%" fill="none" stroke="#4ade80" strokeWidth="1" />
        {/* Outer border */}
        <rect x="3%" y="5%" width="94%" height="90%" fill="none" stroke="#4ade80" strokeWidth="1" />
        {/* Corner arcs */}
        <path d="M 3% 5% Q 4% 4% 5% 5%" fill="none" stroke="#4ade80" strokeWidth="1" />
        <path d="M 97% 5% Q 96% 4% 95% 5%" fill="none" stroke="#4ade80" strokeWidth="1" />
        <path d="M 3% 95% Q 4% 96% 5% 95%" fill="none" stroke="#4ade80" strokeWidth="1" />
        <path d="M 97% 95% Q 96% 96% 95% 95%" fill="none" stroke="#4ade80" strokeWidth="1" />
      </svg>
      {/* Green glow top-right */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      {/* Green glow bottom-left */}
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('chat');
  const [user, setUser] = useState(() => loadUser());
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const stored = loadUser();
    if (stored) setUser(stored);
  }, []);

  const handleAuth = (u: { nickname: string; is_vip: boolean; token: string }) => {
    setUser(u);
    setShowAuth(false);
    setTab('chat');
  };

  const handleLogout = () => {
    setUser(null);
    setTab('chat');
    setShowAuth(false);
  };

  const handleVipActivated = () => {
    const updated = loadUser();
    if (updated) setUser({ ...updated, is_vip: true });
    setTab('profile');
  };

  if (window.location.pathname === '/admin') {
    return <AdminPage />;
  }

  if (showAuth) {
    return (
      <TooltipProvider>
        <FootballBackground />
        <div className="relative z-10">
          <AuthPage onAuth={handleAuth} />
        </div>
      </TooltipProvider>
    );
  }

  const renderPage = () => {
    switch (tab) {
      case 'chat':     return <ChatPage nickname={user?.nickname} />;
      case 'matches':  return <MatchesPage />;
      case 'teams':    return <TeamsPage />;
      case 'stats':    return <StatsPage />;
      case 'forecast': return <ForecastPage />;
      case 'calendar': return <CalendarPage />;
      case 'hot':      return <HotForecastsPage isVip={user?.is_vip || false} nickname={user?.nickname || ''} />;
      case 'profile':  return user
        ? <ProfilePage
            nickname={user.nickname}
            isVip={user.is_vip}
            onLogout={handleLogout}
            onGoVip={() => setTab('vip')}
            onGoHotForecasts={() => setTab('hot')}
          />
        : <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center gap-4">
            <Icon name="User" size={40} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-body">Войди или зарегистрируйся для доступа к личному кабинету</p>
            <button onClick={() => setShowAuth(true)}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold font-body hover:bg-primary/90 transition-all">
              Войти / Регистрация
            </button>
          </div>;
      case 'vip':      return user
        ? <VipPage isVip={user.is_vip} nickname={user.nickname} onVipActivated={handleVipActivated} />
        : <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center gap-4">
            <Icon name="Crown" size={40} className="text-yellow-400" />
            <p className="text-sm text-muted-foreground font-body">Войди чтобы получить VIP подписку</p>
            <button onClick={() => setShowAuth(true)}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold font-body hover:bg-primary/90 transition-all">
              Войти
            </button>
          </div>;
      case 'donate':   return <DonatePage />;
    }
  };

  const BOTTOM_TABS: { id: Tab; icon: string; short: string; badge?: boolean }[] = [
    { id: 'chat',    icon: 'MessageCircle', short: 'Чат' },
    { id: 'matches', icon: 'Activity',      short: 'Матчи', badge: true },
    { id: 'hot',     icon: 'Flame',         short: '🔥' },
    { id: 'donate',  icon: 'Coffee',        short: '☕' },
    { id: 'profile', icon: 'User',          short: 'Профиль' },
  ];

  return (
    <TooltipProvider>
      <FootballBackground />
      <div className="relative z-10 flex h-screen w-screen overflow-hidden">
        {/* ── SIDEBAR desktop ── */}
        <aside className="hidden md:flex flex-col w-60 border-r border-border/60 bg-card/60 backdrop-blur-md flex-shrink-0">
          {/* Logo */}
          <div className="px-5 py-5 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Icon name="Activity" size={14} className="text-primary-foreground" />
              </div>
              <div>
                <div className="font-display text-sm font-bold text-foreground tracking-widest">ANGELA</div>
                <div className="text-[10px] text-muted-foreground font-body">AI Football Analyst</div>
              </div>
            </div>
          </div>

          {/* User */}
          <div className="px-4 py-3 border-b border-border/60">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <Icon name="User" size={16} className="text-primary" />
                  </div>
                  {user.is_vip && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Icon name="Crown" size={8} className="text-black" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold font-body text-foreground">{user.nickname}</div>
                  <div className={`text-[10px] font-body ${user.is_vip ? 'text-yellow-400' : 'text-primary'}`}>
                    {user.is_vip ? '✨ VIP участник' : 'Онлайн'}
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAuth(true)}
                className="w-full flex items-center gap-2 text-xs text-primary font-semibold font-body hover:opacity-80 transition-opacity">
                <Icon name="LogIn" size={14} />
                Войти / Регистрация
              </button>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
            {/* Main tabs */}
            {MAIN_TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all text-left
                  ${tab === t.id
                    ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-[10px]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
              >
                <Icon name={t.icon} size={15} />
                {t.label}
                {t.id === 'matches' && (
                  <span className="ml-auto text-[9px] bg-destructive/80 text-white px-1.5 py-0.5 rounded-full font-semibold">2</span>
                )}
              </button>
            ))}

            <div className="h-px bg-border/50 my-2" />

            {/* Hot forecasts */}
            <button onClick={() => setTab('hot')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all text-left
                ${tab === 'hot'
                  ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-[10px]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
            >
              <Icon name="Flame" size={15} />
              Горячие прогнозы
              <span className="ml-auto text-[9px] bg-destructive/20 text-destructive border border-destructive/30 px-1.5 py-0.5 rounded-full font-semibold">3</span>
            </button>

            {/* VIP */}
            <button onClick={() => setTab('vip')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all text-left
                ${tab === 'vip'
                  ? 'bg-yellow-500/10 text-yellow-400 font-semibold border-l-2 border-yellow-500 pl-[10px]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
            >
              <Icon name="Crown" size={15} />
              VIP подписка
              {!user?.is_vip && <span className="ml-auto text-[9px] text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded-full font-semibold">1200₽</span>}
            </button>

            {/* Donate */}
            <button onClick={() => setTab('donate')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all text-left
                ${tab === 'donate'
                  ? 'bg-amber-500/10 text-amber-400 font-semibold border-l-2 border-amber-500 pl-[10px]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
            >
              <Icon name="Coffee" size={15} />
              Угостить эспрессо
            </button>

            {/* Profile */}
            <button onClick={() => setTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all text-left
                ${tab === 'profile'
                  ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-[10px]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
            >
              <Icon name="User" size={15} />
              Профиль
            </button>
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border/60">
            <div className="text-[10px] text-muted-foreground/40 font-body text-center leading-relaxed">
              Анализ носит информационный<br />характер. Не финансовый совет.
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background/40 backdrop-blur-sm">
          {/* Mobile header */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border/60 bg-card/60 backdrop-blur-md flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Icon name="Activity" size={14} className="text-primary-foreground" />
              </div>
              <span className="font-display text-base font-bold text-foreground tracking-widest">ANGELA</span>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-1.5">
                  {user.is_vip && <Icon name="Crown" size={12} className="text-yellow-400" />}
                  <span className="text-xs text-foreground font-semibold font-body">{user.nickname}</span>
                </div>
              ) : (
                <button onClick={() => setShowAuth(true)}
                  className="text-xs text-primary font-semibold font-body flex items-center gap-1">
                  <Icon name="LogIn" size={13} />Войти
                </button>
              )}
              <div className="relative">
                <img src={ANGELA_AVATAR} alt="Анжела"
                  className="w-8 h-8 rounded-full object-cover object-top border border-primary/30" />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-primary rounded-full border border-card" />
              </div>
            </div>
          </div>

          {/* Page */}
          <div className="flex-1 overflow-hidden">
            {renderPage()}
          </div>

          {/* Mobile bottom nav */}
          <nav className="md:hidden flex border-t border-border/60 bg-card/60 backdrop-blur-md flex-shrink-0">
            {BOTTOM_TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all relative
                  ${tab === t.id ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {tab === t.id && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-b-full" />
                )}
                {t.id === 'hot'
                  ? <span className="text-lg leading-none">🔥</span>
                  : <Icon name={t.icon} size={18} />
                }
                <span className="text-[9px] font-body font-medium">{t.short}</span>
                {t.badge && (
                  <span className="absolute top-1.5 right-2 w-3.5 h-3.5 bg-destructive rounded-full text-[8px] text-white flex items-center justify-center font-bold">2</span>
                )}
              </button>
            ))}
          </nav>
        </main>
      </div>
    </TooltipProvider>
  );
}