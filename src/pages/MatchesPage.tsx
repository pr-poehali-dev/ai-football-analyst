import Icon from '@/components/ui/icon';

const MATCHES = [
  {
    id: 1,
    league: 'Примера',
    leagueFlag: '🇪🇸',
    time: 'LIVE 67\'',
    live: true,
    home: { name: 'Реал Мадрид', score: 2, logo: '⚪' },
    away: { name: 'Барселона', score: 1, logo: '🔵' },
    homeXG: 2.4,
    awayXG: 0.9,
    possession: { home: 48, away: 52 },
    shots: { home: 8, away: 5 },
    prediction: { home: 45, draw: 24, away: 31 },
    status: 'hot',
  },
  {
    id: 2,
    league: 'АПЛ',
    leagueFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    time: '21:00',
    live: false,
    home: { name: 'Манчестер Сити', score: null, logo: '🔵' },
    away: { name: 'Арсенал', score: null, logo: '🔴' },
    homeXG: null,
    awayXG: null,
    possession: null,
    shots: null,
    prediction: { home: 38, draw: 28, away: 34 },
    status: 'upcoming',
  },
  {
    id: 3,
    league: 'Серия А',
    leagueFlag: '🇮🇹',
    time: 'LIVE 34\'',
    live: true,
    home: { name: 'Ювентус', score: 0, logo: '⚫' },
    away: { name: 'Интер', score: 0, logo: '🔵' },
    homeXG: 0.3,
    awayXG: 0.7,
    possession: { home: 55, away: 45 },
    shots: { home: 3, away: 6 },
    prediction: { home: 28, draw: 35, away: 37 },
    status: 'hot',
  },
  {
    id: 4,
    league: 'Бундеслига',
    leagueFlag: '🇩🇪',
    time: 'Завтра 19:30',
    live: false,
    home: { name: 'Бавария', score: null, logo: '🔴' },
    away: { name: 'Боруссия Д', score: null, logo: '🟡' },
    homeXG: null,
    awayXG: null,
    possession: null,
    shots: null,
    prediction: { home: 52, draw: 25, away: 23 },
    status: 'upcoming',
  },
  {
    id: 5,
    league: 'Лига 1',
    leagueFlag: '🇫🇷',
    time: '18:45',
    live: false,
    home: { name: 'ПСЖ', score: null, logo: '🔵' },
    away: { name: 'Марсель', score: null, logo: '⚪' },
    homeXG: null,
    awayXG: null,
    possession: null,
    shots: null,
    prediction: { home: 61, draw: 22, away: 17 },
    status: 'upcoming',
  },
];

function ProbBar({ home, draw, away }: { home: number; draw: number; away: number }) {
  return (
    <div className="flex rounded overflow-hidden h-1.5 w-full">
      <div className="bg-primary transition-all" style={{ width: `${home}%` }} />
      <div className="bg-muted-foreground/40 transition-all" style={{ width: `${draw}%` }} />
      <div className="bg-destructive/70 transition-all" style={{ width: `${away}%` }} />
    </div>
  );
}

export default function MatchesPage() {
  const liveCount = MATCHES.filter(m => m.live).length;

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">МАТЧИ</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Сегодня · {MATCHES.length} матчей</p>
          </div>
          {liveCount > 0 && (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-1.5">
              <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
              <span className="text-xs text-destructive font-semibold font-body">{liveCount} LIVE</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-thin pb-1">
          {['Все', 'Live', 'АПЛ', 'Примера', 'Серия А', 'Бундеслига', 'ЛЧ'].map((f, i) => (
            <button
              key={f}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-body transition-all ${
                i === 0
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Matches list */}
      <div className="px-4 py-4 space-y-3">
        {MATCHES.map((m, idx) => (
          <div
            key={m.id}
            className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all cursor-pointer animate-slide-up"
            style={{ animationDelay: `${idx * 0.07}s` }}
          >
            {/* League + time */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <span className="text-xs text-muted-foreground font-body">
                {m.leagueFlag} {m.league}
              </span>
              <span className={`text-xs font-semibold font-body ${m.live ? 'text-destructive' : 'text-muted-foreground'}`}>
                {m.live && <span className="inline-block w-1.5 h-1.5 bg-destructive rounded-full mr-1.5 animate-pulse" />}
                {m.time}
              </span>
            </div>

            {/* Score row */}
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{m.home.logo}</span>
                  <span className="font-body text-sm font-semibold text-foreground">{m.home.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-lg">{m.away.logo}</span>
                  <span className="font-body text-sm font-medium text-foreground/80">{m.away.name}</span>
                </div>
              </div>

              <div className="text-center px-4">
                {m.live ? (
                  <div className="font-display text-2xl font-bold text-foreground tracking-wider">
                    {m.home.score} <span className="text-muted-foreground/40">:</span> {m.away.score}
                  </div>
                ) : (
                  <div className="font-display text-lg text-muted-foreground">vs</div>
                )}
              </div>

              {/* xG if live */}
              {m.live && m.homeXG !== null && (
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground mb-1 font-body">xG</div>
                  <div className="xg-badge text-xs font-bold px-2 py-0.5 rounded-sm text-primary-foreground text-right">
                    {m.homeXG}
                  </div>
                  <div className="bg-secondary text-xs font-bold px-2 py-0.5 rounded-sm text-muted-foreground mt-1">
                    {m.awayXG}
                  </div>
                </div>
              )}
            </div>

            {/* Stats if live */}
            {m.live && m.possession && (
              <div className="px-4 pb-3 grid grid-cols-2 gap-3 border-t border-border/50 pt-3">
                <div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1 font-body">
                    <span>Владение</span>
                    <span>{m.possession.home}% · {m.possession.away}%</span>
                  </div>
                  <div className="stat-bar">
                    <div className="stat-bar-fill" style={{ width: `${m.possession.home}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1 font-body">
                    <span>Удары</span>
                    <span>{m.shots?.home} · {m.shots?.away}</span>
                  </div>
                  <div className="stat-bar">
                    <div className="stat-bar-fill" style={{ width: `${(m.shots!.home / (m.shots!.home + m.shots!.away)) * 100}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Prediction */}
            <div className="px-4 pb-3 border-t border-border/50 pt-2.5">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5 font-body">
                <span className="text-primary font-semibold">{m.prediction.home}%</span>
                <span>Ничья {m.prediction.draw}%</span>
                <span className="text-destructive/80 font-semibold">{m.prediction.away}%</span>
              </div>
              <ProbBar home={m.prediction.home} draw={m.prediction.draw} away={m.prediction.away} />
              <div className="flex justify-between text-[9px] text-muted-foreground/50 mt-1 font-body">
                <span>{m.home.name}</span>
                <span>{m.away.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
