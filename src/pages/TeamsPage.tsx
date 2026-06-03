import { useState } from 'react';
import Icon from '@/components/ui/icon';

const TEAMS = [
  {
    id: 1, name: 'Реал Мадрид', league: 'Примера', flag: '🇪🇸', logo: '⚪',
    form: ['W','W','D','W','W'],
    pos: 1, pts: 72, gd: '+41',
    xGFor: 2.3, xGAgainst: 0.8,
    possession: 58, shots: 7.2,
    topScorer: 'Мбаппе · 28 г', style: 'Контратаки + позиционная',
    color: 'from-white/10 to-white/5',
    accent: 'text-white',
  },
  {
    id: 2, name: 'Барселона', league: 'Примера', flag: '🇪🇸', logo: '🔵',
    form: ['W','L','W','W','D'],
    pos: 2, pts: 68, gd: '+35',
    xGFor: 2.1, xGAgainst: 0.9,
    possession: 63, shots: 6.8,
    topScorer: 'Ямаль · 18 г', style: 'Высокий прессинг',
    color: 'from-blue-900/30 to-blue-900/10',
    accent: 'text-blue-400',
  },
  {
    id: 3, name: 'Манчестер Сити', league: 'АПЛ', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', logo: '🔵',
    form: ['W','W','W','D','W'],
    pos: 1, pts: 74, gd: '+44',
    xGFor: 2.5, xGAgainst: 0.7,
    possession: 64, shots: 7.8,
    topScorer: 'Холанд · 31 г', style: 'Позиционная игра',
    color: 'from-sky-900/30 to-sky-900/10',
    accent: 'text-sky-400',
  },
  {
    id: 4, name: 'Арсенал', league: 'АПЛ', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', logo: '🔴',
    form: ['W','W','L','W','W'],
    pos: 2, pts: 71, gd: '+38',
    xGFor: 2.2, xGAgainst: 0.85,
    possession: 59, shots: 7.1,
    topScorer: 'Сака · 22 г', style: 'Интенсивный прессинг',
    color: 'from-red-900/30 to-red-900/10',
    accent: 'text-red-400',
  },
  {
    id: 5, name: 'Бавария', league: 'Бундеслига', flag: '🇩🇪', logo: '🔴',
    form: ['W','W','W','W','D'],
    pos: 1, pts: 76, gd: '+51',
    xGFor: 2.7, xGAgainst: 0.75,
    possession: 61, shots: 8.1,
    topScorer: 'Кейн · 36 г', style: 'Атакующий футбол',
    color: 'from-red-900/30 to-red-900/10',
    accent: 'text-red-400',
  },
  {
    id: 6, name: 'ПСЖ', league: 'Лига 1', flag: '🇫🇷', logo: '🔵',
    form: ['W','W','W','W','W'],
    pos: 1, pts: 80, gd: '+58',
    xGFor: 2.9, xGAgainst: 0.6,
    possession: 66, shots: 8.5,
    topScorer: 'Дембеле · 24 г', style: 'Тоталитарный контроль',
    color: 'from-blue-900/30 to-blue-900/10',
    accent: 'text-blue-400',
  },
];

function FormBadge({ result }: { result: string }) {
  const colors: Record<string, string> = {
    W: 'bg-primary text-primary-foreground',
    D: 'bg-muted text-muted-foreground',
    L: 'bg-destructive/80 text-white',
  };
  return (
    <span className={`w-6 h-6 rounded-sm flex items-center justify-center text-[10px] font-bold font-body ${colors[result]}`}>
      {result}
    </span>
  );
}

export default function TeamsPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const team = TEAMS.find(t => t.id === selected);

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">КОМАНДЫ</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Анализ формы и статистики</p>
      </div>

      {selected && team ? (
        // Detail view
        <div className="flex-1 animate-fade-in">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground px-6 py-4 text-sm font-body transition-colors"
          >
            <Icon name="ArrowLeft" size={16} />
            Назад
          </button>

          <div className={`mx-4 mb-4 p-5 rounded-xl bg-gradient-to-br ${team.color} border border-border`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-3xl mb-2">{team.logo}</div>
                <h2 className="font-display text-2xl font-bold text-foreground tracking-wider">{team.name}</h2>
                <p className="text-xs text-muted-foreground font-body mt-0.5">{team.flag} {team.league} · #{team.pos} место · {team.pts} очков</p>
              </div>
              <div className={`text-right ${team.accent}`}>
                <div className="font-display text-3xl font-bold">{team.pts}</div>
                <div className="text-xs font-body">очков</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-2 font-body">Форма (последние 5)</div>
              <div className="flex gap-1.5">
                {team.form.map((r, i) => <FormBadge key={i} result={r} />)}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 px-4 mb-4">
            {[
              { label: 'xG за матч', value: team.xGFor, sub: 'Атака', color: 'text-primary' },
              { label: 'xG против', value: team.xGAgainst, sub: 'Оборона', color: 'text-destructive' },
              { label: 'Владение', value: `${team.possession}%`, sub: 'Среднее', color: 'text-foreground' },
              { label: 'Удары/матч', value: team.shots, sub: 'В среднем', color: 'text-foreground' },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                <div className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground font-body mt-0.5">{s.label}</div>
                <div className="text-[10px] text-muted-foreground/50 font-body">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="px-4 space-y-3 pb-6">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-xs text-muted-foreground font-body mb-1">Лучший бомбардир</div>
              <div className="text-sm font-semibold font-body text-foreground">{team.topScorer}</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="text-xs text-muted-foreground font-body mb-1">Игровой стиль</div>
              <div className="text-sm font-semibold font-body text-foreground">{team.style}</div>
            </div>
          </div>
        </div>
      ) : (
        // List view
        <div className="px-4 py-4 space-y-2">
          {/* Leagues filter */}
          <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-thin pb-1">
            {['Все лиги', 'АПЛ', 'Примера', 'Бундеслига', 'Серия А', 'Лига 1'].map((l, i) => (
              <button key={l} className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-body transition-all ${
                i === 0 ? 'bg-primary text-primary-foreground font-semibold' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}>{l}</button>
            ))}
          </div>

          {TEAMS.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all animate-slide-up"
              style={{ animationDelay: `${idx * 0.06}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.logo}</span>
                  <div>
                    <div className="font-body text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground font-body">{t.flag} {t.league}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {t.form.map((r, i) => <FormBadge key={i} result={r} />)}
                  </div>
                  <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
