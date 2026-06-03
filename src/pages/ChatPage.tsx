import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { apiChat, apiGetPhoto } from '@/lib/api';

const ANGELA_AVATAR = 'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/bucket/5884d2d4-4821-4d6c-9720-09b91b15dde1.jpeg';

interface Message {
  id: number;
  role: 'user' | 'angela';
  text?: string;
  photo?: string;
  time: string;
}

const QUICK_QUESTIONS = [
  'Прогноз на Реал — Барселона',
  'Форма Манчестер Сити',
  'Что такое xG?',
  'Анализ ЛЧ сейчас',
];

function formatMessage(text: string) {
  return text.split('\n').map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return (
      <p key={i} className={line === '' ? 'mt-2' : 'leading-relaxed'}
        dangerouslySetInnerHTML={{ __html: bold }} />
    );
  });
}

interface Props {
  nickname?: string;
  onLogin?: () => void;
}

export default function ChatPage({ nickname, onLogin }: Props) {
  const initMsg: Message = {
    id: 1, role: 'angela',
    text: nickname
      ? `Привет, ${nickname}! 👋 Я Анжела, твой личный футбольный аналитик. Анализирую форму команд, xG, статистику и даю взвешенные прогнозы. Спроси меня о любом матче!`
      : 'Привет! Я Анжела, твой личный футбольный аналитик 👋 Анализирую форму команд, xG, статистику и даю взвешенные прогнозы. Спроси меня о любом матче или команде!',
    time: 'сейчас',
  };

  const [messages, setMessages] = useState<Message[]>([initMsg]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [shownPhotos, setShownPhotos] = useState<string[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getApiMessages = () =>
    messages
      .filter(m => m.text)
      .map(m => ({ role: m.role === 'angela' ? 'assistant' : 'user', content: m.text! }));

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isTyping) return;

    const userMsg: Message = {
      id: Date.now(), role: 'user', text: msg,
      time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const apiMsgs = [...getApiMessages(), { role: 'user', content: msg }];
      const data = await apiChat(apiMsgs);
      const reply: Message = {
        id: Date.now() + 1, role: 'angela',
        text: data.reply || 'Что-то пошло не так. Попробуй ещё раз.',
        time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, reply]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'angela',
        text: 'Упс, нет связи. Попробуй позже.',
        time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendPhoto = async () => {
    if (isTyping) return;
    setIsTyping(true);
    try {
      const data = await apiGetPhoto(shownPhotos);
      if (data.url) {
        setShownPhotos(prev => [...prev, data.url]);
        const photoMsg: Message = {
          id: Date.now(), role: 'angela',
          photo: data.url,
          text: 'Это я 😊 Если хочешь — могу прислать ещё одно фото.',
          time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, photoMsg]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now(), role: 'angela',
        text: 'Не получилось загрузить фото, попробуй позже.',
        time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{ ...initMsg, id: Date.now() }]);
    setShownPhotos([]);
    setShowClearConfirm(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!nickname) {
    return (
      <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center gap-3">
          <div className="relative">
            <img src={ANGELA_AVATAR} alt="Анжела" className="w-9 h-9 rounded-full object-cover object-top" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
          </div>
          <div>
            <div className="font-display text-sm font-bold text-foreground tracking-wider">АНЖЕЛА</div>
            <div className="text-[10px] text-primary font-body">AI Football Analyst</div>
          </div>
        </div>

        {/* Blurred chat preview */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="flex-1 px-4 py-4 space-y-4 blur-sm select-none pointer-events-none">
            {/* Fake angela message */}
            <div className="flex gap-2 justify-start">
              <img src={ANGELA_AVATAR} alt="" className="w-7 h-7 rounded-full object-cover object-top flex-shrink-0 mt-1" />
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[75%]">
                <div className="h-3 w-48 bg-muted rounded mb-1.5" />
                <div className="h-3 w-36 bg-muted rounded mb-1.5" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            </div>
            {/* Fake user message */}
            <div className="flex gap-2 justify-end">
              <div className="bg-primary/20 rounded-2xl rounded-tr-sm px-3 py-2.5 max-w-[65%]">
                <div className="h-3 w-32 bg-primary/30 rounded" />
              </div>
            </div>
            {/* Fake angela long message */}
            <div className="flex gap-2 justify-start">
              <img src={ANGELA_AVATAR} alt="" className="w-7 h-7 rounded-full object-cover object-top flex-shrink-0 mt-1" />
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[80%]">
                <div className="h-3 w-56 bg-muted rounded mb-1.5" />
                <div className="h-3 w-44 bg-muted rounded mb-1.5" />
                <div className="h-3 w-52 bg-muted rounded mb-1.5" />
                <div className="h-3 w-32 bg-muted rounded" />
              </div>
            </div>
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-5 px-8 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <Icon name="Lock" size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground tracking-wider mb-2">ЧАТ ТОЛЬКО ДЛЯ УЧАСТНИКОВ</h2>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  Зарегистрируйся бесплатно, чтобы общаться с Анжелой и получать прогнозы
                </p>
              </div>
              <button
                onClick={onLogin}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl text-sm font-semibold font-body hover:bg-primary/90 transition-all flex items-center gap-2 w-full justify-center"
              >
                <Icon name="LogIn" size={15} />
                Войти / Регистрация
              </button>
              <p className="text-[11px] text-muted-foreground font-body">Бесплатно · 30 секунд</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Angela header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <div className="relative">
          <img src={ANGELA_AVATAR} alt="Анжела"
            className="w-10 h-10 rounded-full object-cover object-top border-2 border-primary/40" />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card animate-pulse-green" />
        </div>
        <div className="flex-1">
          <div className="font-display text-base font-semibold text-foreground tracking-wide">АНЖЕЛА</div>
          <div className="text-[10px] text-primary font-body flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            AI Football Analyst · Онлайн
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={sendPhoto} title="Фото Анжелы"
            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-secondary/50">
            <Icon name="Camera" size={16} />
          </button>
          <button onClick={() => setShowClearConfirm(true)} title="Очистить чат"
            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-secondary/50">
            <Icon name="Trash2" size={16} />
          </button>
        </div>
      </div>

      {/* Clear confirm overlay */}
      {showClearConfirm && (
        <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm flex items-center justify-center px-6 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-xs text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto mb-4">
              <Icon name="Trash2" size={20} className="text-destructive" />
            </div>
            <h3 className="font-display text-base font-bold text-foreground tracking-wide mb-2">ОЧИСТИТЬ ЧАТ?</h3>
            <p className="text-xs text-muted-foreground font-body mb-5">
              Все сообщения будут удалены. Это действие нельзя отменить.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-body hover:text-foreground transition-colors">
                Отмена
              </button>
              <button onClick={clearChat}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-sm font-semibold font-body hover:bg-destructive/90 transition-colors">
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
        {messages.map((msg, idx) => (
          <div key={msg.id}
            className={`flex gap-2.5 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            style={{ animationDelay: `${Math.min(idx, 5) * 0.04}s` }}
          >
            {msg.role === 'angela' && (
              <img src={ANGELA_AVATAR} alt="Анжела"
                className="w-7 h-7 rounded-full object-cover object-top flex-shrink-0 mt-1" />
            )}
            <div className={`max-w-[78%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.photo && (
                <img src={msg.photo} alt="Анжела"
                  className="w-48 h-48 object-cover object-top rounded-xl border border-border mb-1" />
              )}
              {msg.text && (
                <div className={`px-3.5 py-2.5 rounded-xl text-sm ${
                  msg.role === 'angela'
                    ? 'bg-card border border-border text-foreground rounded-tl-sm'
                    : 'bg-primary text-primary-foreground rounded-tr-sm'
                }`}>
                  {formatMessage(msg.text)}
                </div>
              )}
              <span className="text-[10px] text-muted-foreground px-1">{msg.time}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5 animate-fade-in">
            <img src={ANGELA_AVATAR} alt="Анжела"
              className="w-7 h-7 rounded-full object-cover object-top flex-shrink-0 mt-1" />
            <div className="bg-card border border-border rounded-xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-thin flex-shrink-0">
        {QUICK_QUESTIONS.map(q => (
          <button key={q} onClick={() => sendMessage(q)}
            className="flex-shrink-0 text-xs text-muted-foreground border border-border rounded-full px-3 py-1.5 hover:border-primary/50 hover:text-primary transition-colors whitespace-nowrap font-body">
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-1 flex-shrink-0">
        <div className="flex gap-2.5 items-center bg-card border border-border rounded-xl px-4 py-2.5 focus-within:border-primary/50 transition-colors">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Спроси о матче, команде или прогнозе..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-body"
          />
          <button onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="w-7 h-7 flex items-center justify-center bg-primary rounded-lg text-primary-foreground disabled:opacity-30 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95">
            <Icon name="Send" size={13} />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/50 text-center mt-1.5 font-body">
          Не является финансовым советом
        </p>
      </div>
    </div>
  );
}