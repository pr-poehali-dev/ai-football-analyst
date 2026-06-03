import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { apiReviewsList, apiReviewsAdd } from '@/lib/api';

interface Review {
  id: number;
  nickname: string;
  rating: number;
  text: string;
  created_at: string;
}

interface Props {
  nickname?: string;
  onLogin: () => void;
}

function Stars({ rating, size = 16, interactive = false, onChange }: {
  rating: number; size?: number; interactive?: boolean; onChange?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button"
          onClick={() => interactive && onChange?.(i)}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <svg width={size} height={size} viewBox="0 0 24 24" fill={(hovered || rating) >= i ? '#f59e0b' : 'none'}
            stroke={(hovered || rating) >= i ? '#f59e0b' : '#6b7280'} strokeWidth="2">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ReviewsPage({ nickname, onLogin }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => { loadReviews(); }, []);

  const loadReviews = async () => {
    setLoading(true);
    const data = await apiReviewsList();
    setLoading(false);
    if (data.reviews) setReviews(data.reviews);
  };

  const showMsg = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const submit = async () => {
    if (!text.trim()) return;
    setSending(true);
    const data = await apiReviewsAdd(rating, text.trim());
    setSending(false);
    if (data.success) {
      showMsg('Отзыв опубликован! Спасибо 🙏', true);
      setText('');
      setRating(5);
      loadReviews();
    } else {
      showMsg(data.error || 'Ошибка', false);
    }
  };

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="Star" size={20} className="text-yellow-400" />
          <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">ОТЗЫВЫ</h1>
        </div>
        <p className="text-xs text-muted-foreground font-body mt-0.5">Что говорят пользователи об Анжеле</p>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Stats */}
        {reviews.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
            <div className="text-center">
              <div className="font-display text-4xl font-bold text-yellow-400">{avg}</div>
              <Stars rating={Math.round(Number(avg))} size={14} />
              <div className="text-[10px] text-muted-foreground font-body mt-1">{reviews.length} отзывов</div>
            </div>
            <div className="flex-1 space-y-1">
              {[5,4,3,2,1].map(star => {
                const count = reviews.filter(r => r.rating === star).length;
                const pct = reviews.length ? (count / reviews.length * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-body w-2">{star}</span>
                    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-body w-4">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Write review */}
        {nickname ? (
          <div className="bg-card border border-primary/20 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-display font-bold text-foreground tracking-wider">ОСТАВИТЬ ОТЗЫВ</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-body">Оценка:</span>
              <Stars rating={rating} size={20} interactive onChange={setRating} />
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Расскажи как тебе Анжела..."
              maxLength={500}
              rows={3}
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-body">{text.length}/500</span>
              {msg && (
                <span className={`text-xs font-body ${msg.ok ? 'text-primary' : 'text-destructive'}`}>{msg.text}</span>
              )}
              <button onClick={submit} disabled={sending || !text.trim()}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-semibold font-body hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-1.5">
                <Icon name="Send" size={12} />
                {sending ? 'Отправка...' : 'Опубликовать'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center gap-3 text-center">
            <Icon name="Lock" size={20} className="text-muted-foreground" />
            <div>
              <div className="text-sm font-semibold font-body text-foreground mb-1">Войди чтобы оставить отзыв</div>
              <p className="text-xs text-muted-foreground font-body">Только зарегистрированные пользователи могут писать отзывы</p>
            </div>
            <button onClick={onLogin}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold font-body hover:bg-primary/90 transition-all flex items-center gap-2">
              <Icon name="LogIn" size={14} />
              Войти / Регистрация
            </button>
          </div>
        )}

        {/* Reviews list */}
        {loading ? (
          <div className="text-center text-sm text-muted-foreground font-body py-8">Загрузка...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10">
            <Icon name="MessageSquare" size={32} className="text-muted-foreground mx-auto mb-3" />
            <div className="text-sm text-muted-foreground font-body">Пока нет отзывов. Будь первым!</div>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon name="User" size={12} className="text-primary" />
                    </div>
                    <span className="text-sm font-semibold font-body text-foreground">{r.nickname}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stars rating={r.rating} size={12} />
                    <span className="text-[10px] text-muted-foreground font-body">
                      {new Date(r.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-foreground/80 font-body leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
