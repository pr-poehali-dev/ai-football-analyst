import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { apiForecasts } from '@/lib/api';

interface Forecast {
  id: number;
  home_team: string;
  away_team: string;
  league: string;
  match_date: string;
  verdict: string;
  prob_home: number;
  prob_draw: number;
  prob_away: number;
  xg_home: number;
  xg_away: number;
  confidence: number;
  risk_level: string;
  summary: string;
  arguments: string[];
  changer: string;
  is_hot: boolean;
  is_vip: boolean;
  valid_until: string | null;
}

interface Props {
  isVip: boolean;
  nickname: string;
  onLogin: () => void;
}

function Countdown({ validUntil }: { validUntil: string }) {
  const [left, setLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const diff = new Date(validUntil).getTime() - Date.now();
      if (diff <= 0) { setLeft('Обновляется...'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLeft(`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [validUntil]);
  return <span className="font-body font-bold text-primary">{left}</span>;
}

function ProbBar({ home, draw, away }: { home: number; draw: number; away: number }) {
  return (
    <div>
      <div className="flex gap-0.5 h-2 rounded overflow-hidden">
        <div className="bg-primary rounded-l" style={{ width: `${home}%` }} />
        <div className="bg-muted-foreground/40" style={{ width: `${draw}%` }} />
        <div className="bg-destructive/70 rounded-r" style={{ width: `${away}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground font-body mt-1">
        <span className="text-primary font-semibold">{home}%</span>
        <span>Ничья {draw}%</span>
        <span className="text-destructive/70 font-semibold">{away}%</span>
      </div>
    </div>
  );
}

export default function HotForecastsPage({ isVip, nickname, onLogin }: Props) {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nextUpdate, setNextUpdate] = useState<string | null>(null);

  useEffect(() => {
    loadForecasts();
  }, []);

  const loadForecasts = async () => {
    setLoading(true);
    try {
      const data = await apiForecasts();
      setForecasts(data.forecasts || []);
      setNextUpdate(data.next_update || null);
    } catch {
      setError('Не удалось загрузить прогнозы');
    } finally {
      setLoading(false);
    }
  };

  const riskColor: Record<string, string> = {
    'Низкий': 'text-primary',
    'Средний': 'text-yellow-400',
    'Высокий': 'text-destructive',
  };

  if (!nickname) {
    return (
      <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Icon name="Flame" size={20} className="text-destructive" />
            <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">ГОРЯЧИЕ ПРОГНОЗЫ</h1>
          </div>
          <p className="text-xs text-muted-foreground font-body mt-0.5">Ежедневная аналитика Анжелы</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center gap-5">
          {/* Blurred preview cards */}
          <div className="w-full max-w-sm space-y-3 relative mb-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 blur-sm select-none">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 w-28 bg-muted rounded" />
                  <div className="text-muted-foreground font-body text-sm">vs</div>
                  <div className="h-4 w-28 bg-muted rounded" />
                </div>
                <div className="h-2 bg-muted rounded mb-1" />
                <div className="h-3 w-32 bg-muted rounded" />
              </div>
            ))}
            {/* Lock overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-background/80 backdrop-blur-sm rounded-2xl px-5 py-4 border border-border flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Icon name="Lock" size={18} className="text-primary" />
                </div>
                <span className="text-xs font-semibold font-body text-foreground">Только для участников</span>
              </div>
            </div>
          </div>

          <div className="w-10 h-10 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center">
            <Icon name="Flame" size={20} className="text-destructive" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground tracking-wider mb-2">ВОЙДИ, ЧТОБЫ ВИДЕТЬ ПРОГНОЗЫ</h2>
            <p className="text-sm text-muted-foreground font-body leading-relaxed max-w-xs">
              Горячие прогнозы Анжелы доступны только зарегистрированным пользователям
            </p>
          </div>
          <button
            onClick={onLogin}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-xl text-sm font-semibold font-body hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <Icon name="LogIn" size={15} />
            Войти / Регистрация
          </button>
          <p className="text-[11px] text-muted-foreground font-body">Регистрация бесплатна и занимает 30 секунд</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-lg">🔥</span>
              <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">ГОРЯЧИЕ ПРОГНОЗЫ</h1>
            </div>
            <p className="text-xs text-muted-foreground font-body">
              {isVip ? '✨ VIP — все прогнозы открыты' : `3 прогноза · обновление каждые 24ч`}
            </p>
          </div>
          <button onClick={loadForecasts} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
            <Icon name="RefreshCw" size={16} />
          </button>
        </div>

        {nextUpdate && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground font-body">
            <Icon name="Clock" size={12} />
            <span>Следующее обновление через: <Countdown validUntil={nextUpdate} /></span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {loading && (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="flex gap-1.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
            <p className="text-xs text-muted-foreground font-body">Анжела анализирует матчи...</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive font-body">
            {error}
          </div>
        )}

        {!loading && forecasts.map((f, idx) => (
          <div
            key={f.id}
            className={`bg-card border rounded-xl overflow-hidden animate-slide-up ${
              f.is_vip && !isVip ? 'border-yellow-500/30' : f.is_hot ? 'border-primary/20' : 'border-border'
            }`}
            style={{ animationDelay: `${idx * 0.08}s` }}
          >
            {/* VIP lock */}
            {f.is_vip && !isVip ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-3">
                  <Icon name="Crown" size={20} className="text-yellow-400" />
                </div>
                <div className="font-display text-sm font-bold text-foreground tracking-wide mb-1">{f.home_team} — {f.away_team}</div>
                <p className="text-xs text-muted-foreground font-body mb-3">VIP-прогноз. Только для подписчиков.</p>
                <div className="text-xs text-yellow-400 font-semibold font-body">Получи VIP в личном кабинете →</div>
              </div>
            ) : (
              <>
                {/* Match header */}
                <div className="px-4 pt-4 pb-2 border-b border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground font-body">{f.league} · {f.match_date}</span>
                    <div className="flex items-center gap-1.5">
                      {f.is_hot && <span className="text-[10px] text-destructive font-semibold font-body flex items-center gap-0.5">🔥 ТОП</span>}
                      {f.is_vip && <span className="text-[10px] text-yellow-400 font-semibold font-body flex items-center gap-0.5"><Icon name="Crown" size={10} />VIP</span>}
                    </div>
                  </div>
                  <div className="font-display text-base font-bold text-foreground tracking-wide">
                    {f.home_team} — {f.away_team}
                  </div>
                </div>

                {/* Verdict + confidence */}
                <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-[10px] text-muted-foreground font-body mb-0.5">ВЫВОД АНЖЕЛЫ</div>
                    <div className="text-sm font-semibold font-body text-foreground">{f.verdict}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold text-primary">{f.confidence}%</div>
                    <div className="text-[10px] text-muted-foreground font-body">уверен.</div>
                  </div>
                </div>

                {/* Probabilities */}
                <div className="px-4 py-3 border-b border-border/50">
                  <ProbBar home={f.prob_home} draw={f.prob_draw} away={f.prob_away} />
                </div>

                {/* xG */}
                <div className="px-4 py-3 border-b border-border/50 grid grid-cols-3 text-center">
                  <div>
                    <div className="font-display text-lg font-bold text-primary">{f.xg_home}</div>
                    <div className="text-[10px] text-muted-foreground font-body">xG {f.home_team.split(' ')[0]}</div>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-xs text-muted-foreground/40 font-body">vs</span>
                  </div>
                  <div>
                    <div className="font-display text-lg font-bold text-muted-foreground">{f.xg_away}</div>
                    <div className="text-[10px] text-muted-foreground font-body">xG {f.away_team.split(' ')[0]}</div>
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
                    {f.arguments.map((a, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-sm bg-primary/15 text-primary text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i+1}</span>
                        <span className="text-xs text-foreground/80 font-body">{a.replace(/^\d+\.\s*/, '')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk + changer */}
                <div className="px-4 py-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] text-muted-foreground font-body mb-1">РИСК</div>
                    <div className={`text-xs font-semibold font-body ${riskColor[f.risk_level] || 'text-foreground'}`}>{f.risk_level}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground font-body mb-1">ЧТО ИЗМЕНИТ ПРОГНОЗ</div>
                    <div className="text-xs text-foreground/70 font-body">{f.changer}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 px-2 pb-4">
          <Icon name="Info" size={12} className="text-muted-foreground/50 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground/50 font-body leading-relaxed">
            Все прогнозы — аналитические оценки Анжелы. Не являются финансовым советом. Ставки — риск.
          </p>
        </div>
      </div>
    </div>
  );
}