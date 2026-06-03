import Icon from '@/components/ui/icon';

const ANGELA_AVATAR = 'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/bucket/5884d2d4-4821-4d6c-9720-09b91b15dde1.jpeg';

const FAQ = [
  {
    q: 'Как активировать VIP после оплаты?',
    a: 'После перевода напиши в Telegram — мы активируем VIP вручную в течение нескольких минут.',
  },
  {
    q: 'Сколько прогнозов в сутки для бесплатных?',
    a: '3 горячих прогноза в сутки. VIP-участники получают 6 прогнозов, включая эксклюзивные.',
  },
  {
    q: 'На какой срок выдаётся VIP?',
    a: 'VIP подписка действует 30 дней с момента активации.',
  },
  {
    q: 'Как спросить Анжелу про конкретный матч?',
    a: 'Просто напиши название команд в чате — например «Реал Мадрид — Барселона». Анжела сделает полный анализ.',
  },
  {
    q: 'Что такое xG?',
    a: 'xG (ожидаемые голы) — метрика качества моментов. Показывает, сколько голов команда должна была забить по качеству ударов.',
  },
];

export default function SupportPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="HeadphonesIcon" size={20} className="text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">ПОДДЕРЖКА</h1>
        </div>
        <p className="text-xs text-muted-foreground font-body mt-0.5">Мы всегда на связи</p>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Main CTA — Telegram */}
        <a
          href="https://t.me/AiFootballgrup"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <div className="relative overflow-hidden rounded-2xl border border-[#229ED9]/30 bg-gradient-to-br from-[#229ED9]/15 via-[#229ED9]/5 to-transparent p-5 hover:border-[#229ED9]/50 transition-all group">
            <div className="absolute top-3 right-3 opacity-10 text-7xl">✈️</div>
            <div className="flex items-center gap-4 relative">
              <div className="w-14 h-14 rounded-2xl bg-[#229ED9] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#229ED9]/30 group-hover:scale-105 transition-transform">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-display text-base font-bold text-foreground tracking-wider mb-1 flex items-center gap-2">
                  НАПИСАТЬ В TELEGRAM
                  <Icon name="ExternalLink" size={14} className="text-[#229ED9]" />
                </div>
                <div className="text-sm text-[#229ED9] font-body font-semibold mb-0.5">@AiFootballgrup</div>
                <div className="text-xs text-muted-foreground font-body">Чат поддержки · отвечаем быстро</div>
              </div>
            </div>
          </div>
        </a>

        {/* Angela support note */}
        <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
          <img
            src={ANGELA_AVATAR}
            alt="Анжела"
            className="w-10 h-10 rounded-full object-cover object-top flex-shrink-0"
          />
          <div>
            <div className="text-xs font-semibold text-foreground font-body mb-1">Анжела:</div>
            <p className="text-xs text-muted-foreground font-body leading-relaxed italic">
              "Есть вопросы по VIP, прогнозам или работе сервиса? Пиши в наш Telegram — команда всегда поможет!"
            </p>
          </div>
        </div>

        {/* What we help with */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mb-3">Чем поможем</div>
          <div className="space-y-3">
            {[
              { icon: 'Crown', text: 'Активация VIP после оплаты', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
              { icon: 'HelpCircle', text: 'Вопросы по работе сервиса', color: 'text-primary', bg: 'bg-primary/10' },
              { icon: 'MessageCircle', text: 'Обратная связь и предложения', color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { icon: 'AlertCircle', text: 'Технические проблемы', color: 'text-destructive', bg: 'bg-destructive/10' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon name={item.icon} size={14} className={item.color} />
                </div>
                <span className="text-xs text-foreground/80 font-body">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mb-3">Частые вопросы</div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="border-b border-border/50 last:border-0 pb-3 last:pb-0">
                <div className="flex items-start gap-2 mb-1">
                  <span className="text-primary font-bold text-xs font-body mt-0.5 flex-shrink-0">Q</span>
                  <span className="text-xs font-semibold text-foreground font-body">{item.q}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground font-bold text-xs font-body mt-0.5 flex-shrink-0">A</span>
                  <span className="text-xs text-muted-foreground font-body leading-relaxed">{item.a}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <a
          href="https://t.me/AiFootballgrup"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#229ED9] text-white rounded-xl py-3.5 text-sm font-semibold font-body hover:bg-[#229ED9]/90 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          Открыть чат поддержки
        </a>

      </div>
    </div>
  );
}