import { useState } from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import Icon from '@/components/ui/icon';
import ChatPage from '@/pages/ChatPage';
import MatchesPage from '@/pages/MatchesPage';
import TeamsPage from '@/pages/TeamsPage';
import StatsPage from '@/pages/StatsPage';
import ForecastPage from '@/pages/ForecastPage';
import CalendarPage from '@/pages/CalendarPage';

const ANGELA_AVATAR = 'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/files/b3cba21b-b8b7-4945-9402-017eb6079f89.jpg';

type Tab = 'chat' | 'matches' | 'teams' | 'stats' | 'forecast' | 'calendar';

const TABS: { id: Tab; label: string; icon: string; short: string }[] = [
  { id: 'chat', label: 'Чат', icon: 'MessageCircle', short: 'Чат' },
  { id: 'matches', label: 'Матчи', icon: 'Activity', short: 'Матчи' },
  { id: 'teams', label: 'Команды', icon: 'Shield', short: 'Команды' },
  { id: 'stats', label: 'Статистика', icon: 'BarChart2', short: 'Стат' },
  { id: 'forecast', label: 'Прогнозы', icon: 'TrendingUp', short: 'Прогнозы' },
  { id: 'calendar', label: 'Календарь', icon: 'Calendar', short: 'Кал' },
];

function TabContent({ tab }: { tab: Tab }) {
  switch (tab) {
    case 'chat': return <ChatPage />;
    case 'matches': return <MatchesPage />;
    case 'teams': return <TeamsPage />;
    case 'stats': return <StatsPage />;
    case 'forecast': return <ForecastPage />;
    case 'calendar': return <CalendarPage />;
  }
}

export default function App() {
  const [tab, setTab] = useState<Tab>('chat');

  return (
    <TooltipProvider>
      <div className="flex h-screen w-screen bg-background overflow-hidden">
        {/* Sidebar — desktop */}
        <aside className="hidden md:flex flex-col w-56 border-r border-border bg-card flex-shrink-0">
          {/* Logo */}
          <div className="px-5 py-5 border-b border-border">
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

          {/* Angela card */}
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={ANGELA_AVATAR}
                  alt="Анжела"
                  className="w-10 h-10 rounded-full object-cover object-top"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card animate-pulse-green" />
              </div>
              <div>
                <div className="text-xs font-semibold font-body text-foreground">Анжела</div>
                <div className="text-[10px] text-primary font-body">Онлайн · Готова к анализу</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all text-left
                  ${tab === t.id
                    ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-[10px]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
              >
                <Icon name={t.icon} size={16} />
                {t.label}
                {t.id === 'matches' && (
                  <span className="ml-auto text-[10px] bg-destructive/80 text-white px-1.5 py-0.5 rounded-full font-semibold">2</span>
                )}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-border">
            <div className="text-[10px] text-muted-foreground/50 font-body text-center leading-relaxed">
              Анализ носит информационный<br />характер. Не финансовый совет.
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile header */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Icon name="Activity" size={14} className="text-primary-foreground" />
              </div>
              <span className="font-display text-base font-bold text-foreground tracking-widest">ANGELA</span>
            </div>
            <div className="relative">
              <img src={ANGELA_AVATAR} alt="Анжела" className="w-8 h-8 rounded-full object-cover object-top" />
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-primary rounded-full border border-card" />
            </div>
          </div>

          {/* Page content */}
          <div className="flex-1 overflow-hidden">
            <TabContent tab={tab} />
          </div>

          {/* Bottom nav — mobile */}
          <nav className="md:hidden flex border-t border-border bg-card flex-shrink-0">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all relative
                  ${tab === t.id ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {tab === t.id && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-b-full" />
                )}
                <Icon name={t.icon} size={18} />
                <span className="text-[9px] font-body font-medium">{t.short}</span>
                {t.id === 'matches' && (
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
