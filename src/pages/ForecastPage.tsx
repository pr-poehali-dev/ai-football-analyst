import Icon from '@/components/ui/icon';

const FORECASTS = [
  {
    id: 1,
    match: 'Реал Мадрид — Барселона',
    league: '🇪🇸 Примера',
    date: 'Сегодня · 22:00',
    verdict: 'Победа Реала (или ничья)',
    prob: { home: 45, draw: 24, away: 31 },
    xgHome: 2.1,
    xgAway: 1.3,
    confidence: 72,
    risk: 'Средний',
    riskColor: 'text-yellow-400',
    summary: 'Реал в лучшей форме последних 5 матчей. Мбаппе в огне — 4 гола за 3 игры. Барселона сильна в атаке, но уязвима при контратаках.',
    args: ['Реал выиграл 3 из последних 5 домашних матчей против Барсы', 'xG Реала выше на протяжении 7 матчей подряд', 'Барселона без Гави — слабее в центре поля'],
    changer: 'Травма Мбаппе или удаление в первом тайме',
    tag: '🔥 Топ-матч',
    tagColor: 'bg-destructive/20 text-destructive border-destructive/30',
  },
  {
    id: 2,
    match: 'Манчестер Сити — Арсенал',
    league: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 АПЛ',
    date: 'Сегодня · 21:00',
    verdict: 'Ничья или победа Сити',
    prob: { home: 38, draw: 28, away: 34 },
    xgHome: 1.9,
    xgAway: 1.7,
    confidence: 61,
    risk: 'Высокий',
    riskColor: 'text-destructive',
    summary: 'Оба клуба в топ-форме. Арсенал демонстрирует лучший прессинг в АПЛ. Матч равных — ставки рискованны.',
    args: ['Арсенал не проигрывает 11 матчей подряд', 'Сити дома потерял очки дважды за месяц', 'PPDA Арсенала — лучший в лиге (7.2)'],
    changer: 'Кто первым откроет счёт — сильно влияет на тактику',
    tag: '⚖️ Равный',
    tagColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  },
  {
    id: 3,
    match: 'Бавария — Боруссия Д',
    league: '🇩🇪 Бундеслига',
    date: 'Завтра · 19:30',
    verdict: 'Победа Баварии',
    prob: { home: 52, draw: 25, away: 23 },
    xgHome: 2.4,
    xgAway: 1.1,
    confidence: 78,
    risk: 'Низкий',
    riskColor: 'text-primary',
    summary: 'Бавария доминирует дома в этом сезоне. Кейн в абсолютной форме. Боруссия нестабильна в гостях.',
    args: ['Бавария выиграла 8 из 9 домашних матчей', 'Кейн — 36 голов, 12 ассистов в сезоне', 'Боруссия без победы в гостях 4 матча'],
    changer: 'Ранние карточки или форс-мажор с Кейном',
    tag: '✅ Уверенный',
    tagColor: 'bg-primary/10 text-primary border-primary/30',
  },
];

function ProbDots({ home, draw, away, homeTeam, awayTeam }: {
  home: number; draw: number; away: number; homeTeam: string; awayTeam: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex gap-0.5 h-2 rounded overflow-hidden">
        <div className="bg-primary transition-all rounded-l" style={{ width: `${home}%` }} />
        <div className="bg-muted-foreground/40 transition-all" style={{ width: `${draw}%` }} />
        <div className="bg-destructive/70 transition-all rounded-r" style={{ width: `${away}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground font-body">
        <span><span className="text-primary font-semibold">{home}%</span> {homeTeam.split(' ')[0]}</span>
        <span>Ничья {draw}%</span>
        <span>{awayTeam.split(' ')[0]} <span className="text-destructive/80 font-semibold">{away}%</span></span>
      </div>
    </div>
  );
}

export default function ForecastPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">ПРОГНОЗЫ</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Аналитика Анжелы · Вероятности исходов</p>
      </div>

      {/* Disclaimer */}
      <div className="mx-4 mt-4 flex items-center gap-3 bg-secondary/50 border border-border rounded-xl px-4 py-3">
        <Icon name="ShieldAlert" size={16} className="text-muted-foreground flex-shrink-0" />
        <p className="text-[11px] text-muted-foreground font-body leading-relaxed">
          Все прогнозы — аналитические оценки, не финансовый совет. Ставки — это риск.
        </p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {FORECASTS.map((f, idx) => {
          const [homeTeam, awayTeam] = f.match.split(' — ');
          return (
            <div
              key={f.id}
              className="bg-card border border-border rounded-xl overflow-hidden animate-slide-up hover:border-primary/20 transition-all"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Header */}
              <div className="px-4 pt-4 pb-3 border-b border-border/50">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground font-body">{f.league} · {f.date}</span>
                  <span className={`text-[10px] font-body font-semibold px-2 py-0.5 rounded-full border ${f.tagColor}`}>{f.tag}</span>
                </div>
                <h3 className="font-display text-base font-semibold text-foreground tracking-wide">{f.match}</h3>
              </div>

              {/* Verdict */}
              <div className="px-4 py-3 border-b border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[10px] text-muted-foreground font-body mb-0.5">ВЫВОД АНЖЕЛЫ</div>
                    <div className="text-sm font-semibold font-body text-foreground">{f.verdict}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground font-body mb-0.5">Уверенность</div>
                    <div className="font-display text-xl font-bold text-primary">{f.confidence}%</div>
                  </div>
                </div>
                <ProbDots home={f.prob.home} draw={f.prob.draw} away={f.prob.away} homeTeam={homeTeam} awayTeam={awayTeam} />
              </div>

              {/* xG */}
              <div className="px-4 py-3 border-b border-border/50 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="font-display text-lg font-bold text-primary">{f.xgHome}</div>
                  <div className="text-[10px] text-muted-foreground font-body">xG {homeTeam.split(' ')[0]}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-body mt-1">против</div>
                </div>
                <div>
                  <div className="font-display text-lg font-bold text-muted-foreground">{f.xgAway}</div>
                  <div className="text-[10px] text-muted-foreground font-body">xG {awayTeam.split(' ')[0]}</div>
                </div>
              </div>

              {/* Summary */}
              <div className="px-4 py-3 border-b border-border/50">
                <p className="text-xs text-muted-foreground font-body leading-relaxed">{f.summary}</p>
              </div>

              {/* Arguments */}
              <div className="px-4 py-3 border-b border-border/50">
                <div className="text-[10px] text-muted-foreground font-body mb-2">АРГУМЕНТЫ</div>
                <div className="space-y-1.5">
                  {f.args.map((a, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-sm bg-primary/15 text-primary text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                      <span className="text-xs text-foreground/80 font-body">{a}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk + changer */}
              <div className="px-4 py-3 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-muted-foreground font-body mb-1">РИСК</div>
                  <div className={`text-xs font-semibold font-body ${f.riskColor}`}>{f.risk}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-body mb-1">ЧТО ИЗМЕНИТ ПРОГНОЗ</div>
                  <div className="text-xs text-foreground/70 font-body">{f.changer}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
