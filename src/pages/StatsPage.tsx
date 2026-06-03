import Icon from '@/components/ui/icon';

const XG_DATA = [
  { team: 'Бавария', xgFor: 2.7, xgAgainst: 0.75, diff: '+1.95', logo: '🔴' },
  { team: 'ПСЖ', xgFor: 2.9, xgAgainst: 0.6, diff: '+2.30', logo: '🔵' },
  { team: 'Ман Сити', xgFor: 2.5, xgAgainst: 0.7, diff: '+1.80', logo: '🔵' },
  { team: 'Реал', xgFor: 2.3, xgAgainst: 0.8, diff: '+1.50', logo: '⚪' },
  { team: 'Арсенал', xgFor: 2.2, xgAgainst: 0.85, diff: '+1.35', logo: '🔴' },
  { team: 'Барселона', xgFor: 2.1, xgAgainst: 0.9, diff: '+1.20', logo: '🔵' },
];

const POSSESSION_DATA = [
  { team: 'ПСЖ', value: 66, logo: '🔵' },
  { team: 'Барселона', value: 63, logo: '🔵' },
  { team: 'Ман Сити', value: 64, logo: '🔵' },
  { team: 'Бавария', value: 61, logo: '🔴' },
  { team: 'Арсенал', value: 59, logo: '🔴' },
  { team: 'Реал', value: 58, logo: '⚪' },
];

const TOP_SCORERS = [
  { name: 'Э. Холанд', team: 'Ман Сити', goals: 31, xg: 26.4, logo: '🔵' },
  { name: 'Х. Кейн', team: 'Бавария', goals: 36, xg: 31.2, logo: '🔴' },
  { name: 'О. Дембеле', team: 'ПСЖ', goals: 24, xg: 19.8, logo: '🔵' },
  { name: 'К. Мбаппе', team: 'Реал Мадрид', goals: 28, xg: 22.1, logo: '⚪' },
  { name: 'Б. Сака', team: 'Арсенал', goals: 22, xg: 18.9, logo: '🔴' },
];

function XGBar({ value, max = 3 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="stat-bar flex-1">
      <div className="stat-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function StatsPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">СТАТИСТИКА</h1>
        <p className="text-xs text-muted-foreground mt-0.5">xG, владение, бомбардиры</p>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* xG explainer */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Icon name="Target" size={16} className="text-primary" />
            </div>
            <div>
              <div className="font-display text-sm font-semibold text-foreground tracking-wide mb-1">ЧТО ТАКОЕ xG?</div>
              <p className="text-xs text-muted-foreground font-body leading-relaxed">
                Ожидаемые голы (xG) — метрика качества ударов. Удар в упор ≈ 0.85 xG, дальний удар ≈ 0.03 xG. Разница между реальными голами и xG показывает удачу или мастерство реализации.
              </p>
            </div>
          </div>
        </div>

        {/* xG Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-foreground tracking-wider">xG РЕЙТИНГ</h2>
            <span className="text-xs text-muted-foreground font-body">Топ лиги</span>
          </div>
          <div className="divide-y divide-border/50">
            {XG_DATA.map((t, i) => (
              <div key={t.team} className="px-4 py-3 flex items-center gap-3 hover:bg-secondary/30 transition-colors">
                <span className="text-xs text-muted-foreground w-4 font-body">{i + 1}</span>
                <span className="text-base">{t.logo}</span>
                <span className="text-xs font-body font-medium text-foreground flex-1">{t.team}</span>
                <div className="flex items-center gap-2 w-32">
                  <XGBar value={t.xgFor} />
                  <span className="text-xs font-body font-semibold text-primary w-8 text-right">{t.xgFor}</span>
                </div>
                <span className={`text-xs font-body font-bold w-12 text-right ${
                  parseFloat(t.diff) > 1.5 ? 'text-primary' : 'text-muted-foreground'
                }`}>{t.diff}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Possession */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-display text-sm font-semibold text-foreground tracking-wider">ВЛАДЕНИЕ МЯЧОМ</h2>
          </div>
          <div className="px-4 py-3 space-y-3">
            {POSSESSION_DATA.map((t) => (
              <div key={t.team} className="flex items-center gap-3">
                <span className="text-sm">{t.logo}</span>
                <span className="text-xs font-body text-foreground w-20">{t.team}</span>
                <div className="flex-1 stat-bar">
                  <div className="stat-bar-fill" style={{ width: `${t.value}%` }} />
                </div>
                <span className="text-xs font-body font-bold text-foreground w-10 text-right">{t.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Scorers */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-foreground tracking-wider">БОМБАРДИРЫ</h2>
            <span className="text-xs text-muted-foreground font-body">Голы / xG</span>
          </div>
          <div className="divide-y divide-border/50">
            {TOP_SCORERS.map((p, i) => (
              <div key={p.name} className="px-4 py-3 flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4 font-body">{i + 1}</span>
                <span className="text-base">{p.logo}</span>
                <div className="flex-1">
                  <div className="text-xs font-body font-semibold text-foreground">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground font-body">{p.team}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-bold text-foreground">{p.goals}</div>
                  <div className="text-[10px] text-muted-foreground font-body">xG {p.xg}</div>
                </div>
                <div className={`text-xs font-body font-bold ml-2 ${p.goals > p.xg ? 'text-primary' : 'text-muted-foreground'}`}>
                  {p.goals > p.xg ? `+${(p.goals - p.xg).toFixed(1)}` : (p.goals - p.xg).toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics glossary */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-display text-sm font-semibold text-foreground tracking-wider mb-3">КЛЮЧЕВЫЕ МЕТРИКИ</h2>
          <div className="space-y-2">
            {[
              { key: 'xG', desc: 'Ожидаемые голы — качество моментов' },
              { key: 'PPDA', desc: 'Давление на пас — интенсивность прессинга' },
              { key: 'xGA', desc: 'Ожидаемые голы против — качество обороны' },
              { key: 'SoT', desc: 'Удары в створ — точность атак' },
            ].map(m => (
              <div key={m.key} className="flex gap-3">
                <span className="xg-badge text-[10px] font-bold px-2 py-0.5 rounded-sm self-start mt-0.5 flex-shrink-0">{m.key}</span>
                <span className="text-xs text-muted-foreground font-body">{m.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
