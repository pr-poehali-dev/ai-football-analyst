import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const ANGELA_AVATAR = 'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/files/b3cba21b-b8b7-4945-9402-017eb6079f89.jpg';

interface Message {
  id: number;
  role: 'user' | 'angela';
  text: string;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: 'angela',
    text: 'Привет! Я Анжела, твой личный футбольный аналитик 👋 Я анализирую форму команд, составы, xG, статистику и даю взвешенные прогнозы. Спроси меня о любом матче или команде — разберём вместе.',
    time: 'сейчас',
  }
];

const QUICK_QUESTIONS = [
  'Прогноз на Реал Мадрид — Барселона',
  'Форма Манчестер Сити сейчас',
  'xG объясни простыми словами',
  'Анализ Лиги Чемпионов',
];

const ANGELA_RESPONSES: Record<string, string> = {
  default: 'Отличный вопрос! Чтобы дать точный анализ, мне нужно немного времени собрать актуальные данные. Пока могу сказать: ключевые факторы для этого матча — текущая форма, травмы ключевых игроков и домашнее/гостевое преимущество. Хочешь, уточни команды и дату — и я сделаю полный разбор.',
  'xG': 'xG (ожидаемые голы) — это метрика, которая показывает, сколько голов *должна была* забить команда исходя из качества моментов. Например, удар в упор с 2 метров имеет xG ≈ 0.85 (85% голов в такой ситуации), а дальний удар с 30 метров — xG ≈ 0.03. Если команда долго "недобивает" (реальных голов меньше xG), это сигнал: либо плохо реализует, либо везёт сопернику. Это один из лучших индикаторов будущих результатов 📊',
  'реал': '**Реал Мадрид — Барселона (Эль Класико)**\n\n📋 Вывод: Реал в чуть лучшей форме при прочих равных.\n\n📊 Вероятности:\n• Победа Реала — 42%\n• Ничья — 26%\n• Победа Барсы — 32%\n\n⚡ Аргументы за Реал: Мбаппе в огне, домашний стадион "Сантьяго Бернабеу", крепкая оборона. Барселона: Лямин Ямаль — открытие сезона, контрпрессинг на высшем уровне.\n\n⚠️ Риск: Классико непредсказуемо. Любой момент может изменить всё.\n\n🔄 Что может изменить прогноз: состав в день матча, травмы, погода.\n\n*Это аналитика, не финансовый совет. Ставки — риск.*',
  'манчестер': '**Манчестер Сити — Анализ формы**\n\n📋 Вывод: Команда Гвардиолы восстанавливается после нестабильного начала сезона.\n\n📊 Последние 5 матчей: В В Н П В\n• Владение: 64% в среднем\n• xG за: 2.1 | xG против: 0.9\n• Удары в цель: 6.4 за матч\n\n⚡ Сильные стороны: структура, позиционная игра, глубина состава. Эрлинг Холанд — топовая реализация.\n\n⚠️ Уязвимость: контратаки при высокой линии обороны.\n\n🔄 Слежу за: возвращением ключевых игроков из травм.',
};

function getAngieResponse(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('xg') || lower.includes('ожидаем')) return ANGELA_RESPONSES['xG'];
  if (lower.includes('реал') || lower.includes('барселон') || lower.includes('класико')) return ANGELA_RESPONSES['реал'];
  if (lower.includes('манчестер') || lower.includes('сити') || lower.includes('city')) return ANGELA_RESPONSES['манчестер'];
  return ANGELA_RESPONSES['default'];
}

function formatMessage(text: string) {
  return text.split('\n').map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <p key={i} className={line === '' ? 'mt-2' : ''} dangerouslySetInnerHTML={{ __html: bold }} />;
  });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      text: msg,
      time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply: Message = {
        id: Date.now() + 1,
        role: 'angela',
        text: getAngieResponse(msg),
        time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      };
      setIsTyping(false);
      setMessages(prev => [...prev, reply]);
    }, 1400 + Math.random() * 600);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Angela header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border glass">
        <div className="relative">
          <img
            src={ANGELA_AVATAR}
            alt="Анжела"
            className="w-12 h-12 rounded-full object-cover object-top border-2 border-primary/40"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background animate-pulse-green" />
        </div>
        <div>
          <div className="font-display text-lg font-semibold text-foreground tracking-wide">АНЖЕЛА</div>
          <div className="text-xs text-primary font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            AI Football Analyst · Онлайн
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-sm font-body">
            xG · Live · Прогнозы
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin">
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            {msg.role === 'angela' && (
              <img
                src={ANGELA_AVATAR}
                alt="Анжела"
                className="w-8 h-8 rounded-full object-cover object-top flex-shrink-0 mt-1"
              />
            )}
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div
                className={`px-4 py-3 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'angela'
                    ? 'bg-card border border-border text-foreground rounded-tl-sm'
                    : 'bg-primary text-primary-foreground rounded-tr-sm'
                }`}
              >
                {formatMessage(msg.text)}
              </div>
              <span className="text-[10px] text-muted-foreground px-1">{msg.time}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 animate-fade-in">
            <img
              src={ANGELA_AVATAR}
              alt="Анжела"
              className="w-8 h-8 rounded-full object-cover object-top flex-shrink-0 mt-1"
            />
            <div className="bg-card border border-border rounded-xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-thin">
        {QUICK_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            className="flex-shrink-0 text-xs text-muted-foreground border border-border rounded-full px-3 py-1.5 hover:border-primary/50 hover:text-primary transition-colors whitespace-nowrap font-body"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex gap-3 items-center bg-card border border-border rounded-xl px-4 py-3 focus-within:border-primary/50 transition-colors">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Спроси о матче, команде или прогнозе..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-body"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="w-8 h-8 flex items-center justify-center bg-primary rounded-lg text-primary-foreground disabled:opacity-30 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
          >
            <Icon name="Send" size={14} />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/60 text-center mt-2 font-body">
          Анализ носит информационный характер и не является финансовым советом
        </p>
      </div>
    </div>
  );
}
