import Icon from '@/components/ui/icon';
import { apiBuyVip } from '@/lib/api';
import { updateUser } from '@/lib/auth';
import { useState } from 'react';

interface Props {
  isVip: boolean;
  nickname: string;
  onVipActivated: () => void;
}

const VIP_FEATURES = [
  { icon: 'Flame', text: 'Все горячие прогнозы без ограничений', vip: true },
  { icon: 'TrendingUp', text: 'Эксклюзивные VIP-прогнозы Анжелы', vip: true },
  { icon: 'BarChart2', text: 'Расширенная статистика и xG-анализ', vip: true },
  { icon: 'MessageCircle', text: 'Приоритетный чат с Анжелой', vip: true },
  { icon: 'Bell', text: 'Уведомления о топ-матчах', vip: true },
  { icon: 'Crown', text: 'VIP-значок в профиле', vip: true },
];

const FREE_FEATURES = [
  { icon: 'MessageCircle', text: 'Чат с Анжелой', vip: false },
  { icon: 'Activity', text: 'Live-матчи', vip: false },
  { icon: 'Shield', text: 'Статистика команд', vip: false },
  { icon: 'Flame', text: '3 горячих прогноза в сутки', vip: false },
];

export default function VipPage({ isVip, nickname, onVipActivated }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleBuy = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiBuyVip();
      if (res.success) {
        updateUser({ is_vip: true });
        setSuccess(true);
        setTimeout(() => onVipActivated(), 1500);
      } else {
        setError(res.error || 'Ошибка активации');
      }
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  if (isVip) {
    return (
      <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
        <div className="px-6 py-5 border-b border-border">
          <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">VIP</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500/40 flex items-center justify-center mb-6 animate-pulse-green">
            <Icon name="Crown" size={36} className="text-yellow-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground tracking-wider mb-2">VIP АКТИВЕН</h2>
          <p className="text-sm text-muted-foreground font-body mb-6">
            Привет, <span className="text-yellow-400 font-semibold">{nickname}</span>! Тебе открыты все возможности Анжелы.
          </p>
          <div className="w-full max-w-xs space-y-2">
            {VIP_FEATURES.map(f => (
              <div key={f.text} className="flex items-center gap-3 text-left">
                <div className="w-6 h-6 rounded-sm bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="Check" size={12} className="text-yellow-400" />
                </div>
                <span className="text-xs text-foreground/80 font-body">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="Crown" size={20} className="text-yellow-400" />
          <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">VIP ПОДПИСКА</h1>
        </div>
        <p className="text-xs text-muted-foreground font-body mt-0.5">Полный доступ к аналитике Анжелы</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Hero card */}
        <div className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-yellow-500/5 to-transparent p-6">
          <div className="absolute top-3 right-3 opacity-10">
            <Icon name="Crown" size={80} className="text-yellow-400" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Crown" size={18} className="text-yellow-400" />
              <span className="font-display text-sm font-bold text-yellow-400 tracking-wider">ANGELA VIP</span>
            </div>
            <div className="font-display text-4xl font-bold text-foreground mb-1">
              1 200 <span className="text-2xl text-muted-foreground">₽</span>
            </div>
            <div className="text-xs text-muted-foreground font-body">за 30 дней · всё включено</div>
          </div>
        </div>

        {/* Comparison */}
        <div className="grid grid-cols-2 gap-3">
          {/* Free */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-xs font-display font-semibold text-muted-foreground tracking-wider mb-3">БЕСПЛАТНО</div>
            <div className="space-y-2">
              {FREE_FEATURES.map(f => (
                <div key={f.text} className="flex items-start gap-2">
                  <Icon name="Check" size={12} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-[10px] text-muted-foreground font-body leading-relaxed">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* VIP */}
          <div className="bg-yellow-500/5 border border-yellow-500/30 rounded-xl p-4">
            <div className="text-xs font-display font-semibold text-yellow-400 tracking-wider mb-3 flex items-center gap-1">
              <Icon name="Crown" size={10} />VIP
            </div>
            <div className="space-y-2">
              {[...FREE_FEATURES, ...VIP_FEATURES.slice(0, 3)].map(f => (
                <div key={f.text} className="flex items-start gap-2">
                  <Icon name="Check" size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <span className="text-[10px] text-foreground/80 font-body leading-relaxed">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* VIP features list */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs font-display font-semibold text-foreground tracking-wider mb-3">ЧТО ВХОДИТ В VIP</div>
          <div className="space-y-2.5">
            {VIP_FEATURES.map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon name={f.icon} size={14} className="text-yellow-400" />
                </div>
                <span className="text-xs text-foreground/80 font-body">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Angela quote */}
        <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
          <img
            src="https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/files/b3cba21b-b8b7-4945-9402-017eb6079f89.jpg"
            alt="Анжела"
            className="w-10 h-10 rounded-full object-cover object-top flex-shrink-0"
          />
          <div>
            <div className="text-xs font-semibold text-foreground font-body mb-1">Анжела:</div>
            <p className="text-xs text-muted-foreground font-body leading-relaxed italic">
              "С VIP я открою тебе полный арсенал аналитики — эксклюзивные прогнозы, глубокий xG-разбор и всё, что нужно для понимания игры."
            </p>
          </div>
        </div>

        {/* Payment block */}
        <div className="bg-card border border-yellow-500/30 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border/60 bg-yellow-500/5">
            <div className="flex items-center gap-2">
              <Icon name="QrCode" size={16} className="text-yellow-400" />
              <span className="font-display text-sm font-bold text-foreground tracking-wider">ОПЛАТА ЧЕРЕЗ СБП</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-body mt-0.5">Ozon Банк · Система быстрых платежей</p>
          </div>

          <div className="p-5 flex flex-col items-center gap-4">

            {/* Phone СБП */}
            <div className="w-full bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
              <div className="text-[10px] text-muted-foreground font-body mb-2 uppercase tracking-wider">Перевод по номеру телефона СБП</div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Phone" size={15} className="text-yellow-400" />
                  </div>
                  <span className="font-display text-xl font-bold text-foreground tracking-wider">+7 962 868-99-99</span>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText('+79628689999')}
                  className="text-[10px] text-yellow-400 border border-yellow-500/30 rounded-lg px-2.5 py-1.5 font-body hover:bg-yellow-500/10 transition-colors flex items-center gap-1"
                >
                  <Icon name="Copy" size={11} />
                  Скопировать
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 h-px bg-border/60" />
              <span className="text-[10px] text-muted-foreground font-body">или по QR-коду</span>
              <div className="flex-1 h-px bg-border/60" />
            </div>

            {/* QR */}
            <div className="bg-white rounded-2xl p-3 shadow-lg shadow-black/30">
              <img
                src="https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/bucket/c930221e-3473-4aa5-a270-3f96ede2ed7b.jpeg"
                alt="QR-код СБП Ozon Банк"
                className="w-44 h-44 object-contain rounded-lg"
              />
            </div>

            {/* Instructions */}
            <div className="w-full space-y-2">
              {[
                { n: '1', text: 'Открой приложение своего банка' },
                { n: '2', text: 'СБП → по номеру телефона или QR-коду' },
                { n: '3', text: 'Переведи ровно 1 200 ₽' },
                { n: '4', text: 'В комментарии укажи свой никнейм' },
              ].map(s => (
                <div key={s.n} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-bold flex items-center justify-center flex-shrink-0 font-body">
                    {s.n}
                  </span>
                  <span className="text-xs text-foreground/80 font-body">{s.text}</span>
                </div>
              ))}
            </div>

            {/* Amount */}
            <div className="w-full bg-yellow-500/8 border border-yellow-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-body">Сумма перевода</span>
              <span className="font-display text-xl font-bold text-yellow-400">1 200 ₽</span>
            </div>
          </div>
        </div>

        {/* Confirm payment button */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-body mb-3 text-center">
            После оплаты нажми кнопку — VIP активируется вручную в течение нескольких минут
          </p>

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2.5 text-xs text-destructive font-body flex items-center gap-2 mb-3">
              <Icon name="AlertCircle" size={13} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-primary/10 border border-primary/30 rounded-xl px-3 py-2.5 text-xs text-primary font-body flex items-center gap-2 mb-3 animate-fade-in">
              <Icon name="CheckCircle" size={13} className="flex-shrink-0" />
              Заявка отправлена! VIP будет активирован в ближайшее время 🎉
            </div>
          )}

          <button
            onClick={handleBuy}
            disabled={loading || success}
            className="w-full py-3.5 rounded-xl font-display text-sm font-bold tracking-wider bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:opacity-90 disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="typing-dot bg-black" /><span className="typing-dot bg-black" /><span className="typing-dot bg-black" /></>
            ) : success ? (
              <><Icon name="Check" size={16} />ЗАЯВКА ОТПРАВЛЕНА</>
            ) : (
              <><Icon name="CheckCircle" size={16} />Я ОПЛАТИЛ — АКТИВИРОВАТЬ VIP</>
            )}
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground/40 text-center font-body pb-4 leading-relaxed">
          После подтверждения оплаты VIP активируется вручную.<br />Не является финансовым советом.
        </p>
      </div>
    </div>
  );
}