import Icon from '@/components/ui/icon';

const EVENTS = [
  {
    date: '3 июня',
    day: 'Сегодня',
    matches: [
      { time: '18:45', home: 'ПСЖ', away: 'Марсель', league: '🇫🇷 Лига 1', status: 'upcoming' },
      { time: '21:00', home: 'Ман Сити', away: 'Арсенал', league: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 АПЛ', status: 'featured' },
      { time: '22:00', home: 'Реал Мадрид', away: 'Барселона', league: '🇪🇸 Примера', status: 'featured' },
    ]
  },
  {
    date: '4 июня',
    day: 'Завтра',
    matches: [
      { time: '16:00', home: 'Интер', away: 'Милан', league: '🇮🇹 Серия А', status: 'upcoming' },
      { time: '19:30', home: 'Бавария', away: 'Боруссия Д', league: '🇩🇪 Бундеслига', status: 'upcoming' },
      { time: '21:45', home: 'Атлетико', away: 'Вильяреал', league: '🇪🇸 Примера', status: 'upcoming' },
    ]
  },
  {
    date: '5 июня',
    day: 'Четверг',
    matches: [
      { time: '20:00', home: 'Тоттенхэм', away: 'Челси', league: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 АПЛ', status: 'upcoming' },
      { time: '21:00', home: 'Реал Сосьедад', away: 'Бетис', league: '🇪🇸 Примера', status: 'upcoming' },
    ]
  },
  {
    date: '7 июня',
    day: 'Суббота',
    matches: [
      { time: '14:30', home: 'Ливерпуль', away: 'Манчестер Ю', league: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 АПЛ', status: 'upcoming' },
      { time: '17:00', home: 'Лацио', away: 'Рома', league: '🇮🇹 Серия А', status: 'upcoming' },
      { time: '19:00', home: 'Лион', away: 'Монако', league: '🇫🇷 Лига 1', status: 'upcoming' },
      { time: '21:00', home: 'Хетафе', away: 'Реал Мадрид', league: '🇪🇸 Примера', status: 'upcoming' },
    ]
  },
];

const COMPETITIONS = [
  { name: 'Лига Чемпионов', date: '14–15 мая', stage: 'Финал', icon: '🏆', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
  { name: 'Лига Европы', date: '21 мая', stage: 'Финал', icon: '🥈', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
  { name: 'Чемпионат мира 2026', date: 'Июнь-июль', stage: 'Групповой этап', icon: '🌍', color: 'text-primary border-primary/30 bg-primary/10' },
];

export default function CalendarPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">КАЛЕНДАРЬ</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Расписание матчей</p>
      </div>

      {/* Key events */}
      <div className="px-4 pt-4">
        <div className="text-xs text-muted-foreground font-body mb-3 uppercase tracking-wider">Ключевые турниры</div>
        <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-3">
          {COMPETITIONS.map(c => (
            <div key={c.name} className={`flex-shrink-0 border rounded-xl px-4 py-3 min-w-36 ${c.color}`}>
              <div className="text-xl mb-1">{c.icon}</div>
              <div className="font-display text-xs font-bold tracking-wide">{c.name}</div>
              <div className="text-[10px] mt-0.5 opacity-70 font-body">{c.date}</div>
              <div className="text-[10px] font-semibold font-body mt-1">{c.stage}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule */}
      <div className="px-4 py-2 space-y-5">
        {EVENTS.map(day => (
          <div key={day.date}>
            {/* Day header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="text-xs font-display font-semibold tracking-wider text-foreground">{day.day.toUpperCase()}</div>
              <div className="text-xs text-muted-foreground font-body">{day.date}</div>
              <div className="flex-1 h-px bg-border" />
              <div className="text-[10px] text-muted-foreground font-body">{day.matches.length} матча</div>
            </div>

            <div className="space-y-2">
              {day.matches.map((m, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:border-primary/30 cursor-pointer
                    ${m.status === 'featured'
                      ? 'bg-card border-primary/20 shadow-sm shadow-primary/5'
                      : 'bg-card border-border'
                    }`}
                >
                  {/* Time */}
                  <div className="text-center w-12">
                    <div className={`font-display text-sm font-bold ${m.status === 'featured' ? 'text-primary' : 'text-muted-foreground'}`}>
                      {m.time}
                    </div>
                  </div>

                  <div className="w-px h-8 bg-border" />

                  {/* Match */}
                  <div className="flex-1">
                    <div className="font-body text-sm font-semibold text-foreground">
                      {m.home} <span className="text-muted-foreground/40 font-normal">—</span> {m.away}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-body mt-0.5">{m.league}</div>
                  </div>

                  {/* Featured badge */}
                  {m.status === 'featured' && (
                    <div className="flex items-center gap-1 text-[10px] text-primary font-semibold font-body">
                      <Icon name="Star" size={10} />
                      ТОП
                    </div>
                  )}

                  <Icon name="ChevronRight" size={14} className="text-muted-foreground/40" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Angela tip */}
      <div className="mx-4 my-4 bg-card border border-border rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Icon name="Lightbulb" size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-semibold font-body text-foreground mb-1">Совет Анжелы</div>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              Спроси меня о прогнозе на любой из матчей — перейди в Чат и назови команды. Сделаю полный разбор с xG и вероятностями.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
