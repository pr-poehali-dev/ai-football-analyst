import { useState } from 'react';
import Icon from '@/components/ui/icon';

const AMOUNTS = [100, 200, 500, 1000];

const ANGELA_AVATAR = 'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/bucket/5884d2d4-4821-4d6c-9720-09b91b15dde1.jpeg';

export default function DonatePage() {
  const [copied, setCopied] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(200);

  const copyPhone = () => {
    navigator.clipboard.writeText('+79628689999');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xl">☕</span>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">ПОДДЕРЖАТЬ</h1>
        </div>
        <p className="text-xs text-muted-foreground font-body mt-0.5">Угости Анжелу чашечкой эспрессо</p>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-900/20 via-amber-800/10 to-transparent p-6">
          <div className="absolute top-3 right-3 opacity-10 text-8xl">☕</div>
          <div className="flex items-center gap-4 relative">
            <img
              src={ANGELA_AVATAR}
              alt="Анжела"
              className="w-16 h-16 rounded-full object-cover object-top border-2 border-amber-500/40 flex-shrink-0"
            />
            <div>
              <div className="font-display text-sm font-bold text-amber-400 tracking-wider mb-1">АНЖЕЛА ГОВОРИТ:</div>
              <p className="text-xs text-foreground/80 font-body leading-relaxed italic">
                "Каждый эспрессо помогает мне анализировать ещё больше матчей. Спасибо, что веришь в меня!"
              </p>
            </div>
          </div>
        </div>

        {/* Amount selector */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mb-3">Выбери сумму или введи свою</div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => setSelectedAmount(a)}
                className={`py-2.5 rounded-xl text-sm font-bold font-display transition-all border ${
                  selectedAmount === a
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-400'
                    : 'border-border text-muted-foreground hover:border-amber-500/30 hover:text-foreground'
                }`}
              >
                {a}₽
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Своя сумма..."
              onChange={e => setSelectedAmount(Number(e.target.value) || null)}
              className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50"
            />
            <span className="text-sm text-muted-foreground font-body">₽</span>
          </div>
        </div>

        {/* Payment block */}
        <div className="bg-card border border-amber-500/30 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border/60 bg-amber-500/5">
            <div className="flex items-center gap-2">
              <Icon name="QrCode" size={16} className="text-amber-400" />
              <span className="font-display text-sm font-bold text-foreground tracking-wider">ОПЛАТА ЧЕРЕЗ СБП</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-body mt-0.5">Ozon Банк · Система быстрых платежей</p>
          </div>

          <div className="p-5 flex flex-col items-center gap-4">

            {/* Phone */}
            <div className="w-full bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <div className="text-[10px] text-muted-foreground font-body mb-3 uppercase tracking-wider">Перевод по номеру телефона СБП</div>

              {/* Banks */}
              <div className="flex items-center gap-2 mb-3">
                <div className="text-[10px] text-muted-foreground font-body">Получаем на:</div>
                <div className="flex items-center gap-1.5 bg-[#005BFF]/10 border border-[#005BFF]/30 rounded-lg px-2.5 py-1.5">
                  <div className="w-4 h-4 rounded-sm bg-[#005BFF] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[8px] font-bold leading-none">O</span>
                  </div>
                  <span className="text-[11px] text-[#005BFF] font-bold font-body">Ozon Банк</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#21A038]/10 border border-[#21A038]/30 rounded-lg px-2.5 py-1.5">
                  <div className="w-4 h-4 rounded-sm bg-[#21A038] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[8px] font-bold leading-none">С</span>
                  </div>
                  <span className="text-[11px] text-[#21A038] font-bold font-body">Сбербанк</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Phone" size={15} className="text-amber-400" />
                  </div>
                  <span className="font-display text-xl font-bold text-foreground tracking-wider">+7 962 868-99-99</span>
                </div>
                <button
                  onClick={copyPhone}
                  className={`text-[10px] border rounded-lg px-2.5 py-1.5 font-body transition-all flex items-center gap-1 ${
                    copied
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                      : 'text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
                  }`}
                >
                  <Icon name={copied ? 'Check' : 'Copy'} size={11} />
                  {copied ? 'Скопировано!' : 'Скопировать'}
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
                alt="QR-код СБП"
                className="w-44 h-44 object-contain rounded-lg"
              />
            </div>

            {/* Instructions */}
            <div className="w-full space-y-2">
              {[
                { n: '1', text: 'Открой приложение своего банка' },
                { n: '2', text: 'СБП → по номеру телефона или QR-коду' },
                { n: '3', text: `Переведи любую сумму${selectedAmount ? ` (например ${selectedAmount} ₽)` : ''}` },
                { n: '4', text: 'В комментарии напиши «Эспрессо»' },
              ].map(s => (
                <div key={s.n} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center flex-shrink-0 font-body">
                    {s.n}
                  </span>
                  <span className="text-xs text-foreground/80 font-body">{s.text}</span>
                </div>
              ))}
            </div>

            {/* Amount display */}
            {selectedAmount && selectedAmount > 0 && (
              <div className="w-full bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">☕</span>
                  <span className="text-xs text-muted-foreground font-body">Твой вклад</span>
                </div>
                <span className="font-display text-xl font-bold text-amber-400">{selectedAmount} ₽</span>
              </div>
            )}
          </div>
        </div>

        {/* Thank you note */}
        <div className="flex items-start gap-3 bg-card border border-border rounded-xl p-4">
          <img
            src={ANGELA_AVATAR}
            alt="Анжела"
            className="w-10 h-10 rounded-full object-cover object-top flex-shrink-0"
          />
          <div>
            <div className="text-xs font-semibold text-foreground font-body mb-1">Анжела:</div>
            <p className="text-xs text-muted-foreground font-body leading-relaxed italic">
              "Любая сумма — это огромная поддержка. Я буду анализировать матчи с ещё большей страстью. Спасибо от всего сердца!"
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}