import Icon from '@/components/ui/icon';
import { logout } from '@/lib/auth';

const ANGELA_AVATAR = 'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/bucket/5884d2d4-4821-4d6c-9720-09b91b15dde1.jpeg';

interface Props {
  nickname: string;
  isVip: boolean;
  onLogout: () => void;
  onGoVip: () => void;
  onGoHotForecasts: () => void;
}

export default function ProfilePage({ nickname, isVip, onLogout, onGoVip, onGoHotForecasts }: Props) {
  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin">
      <div className="px-6 py-5 border-b border-border">
        <h1 className="font-display text-2xl font-bold text-foreground tracking-wider">ПРОФИЛЬ</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Личный кабинет</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* User card */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <Icon name="User" size={24} className="text-primary" />
              </div>
              {isVip && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Icon name="Crown" size={10} className="text-black" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="font-display text-xl font-bold text-foreground tracking-wide">{nickname}</div>
              <div className={`flex items-center gap-1.5 mt-0.5 text-xs font-body font-semibold ${isVip ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                {isVip ? (
                  <><Icon name="Crown" size={12} />VIP участник</>
                ) : (
                  <><Icon name="User" size={12} />Стандартный аккаунт</>
                )}
              </div>
            </div>
          </div>

          {!isVip && (
            <button
              onClick={onGoVip}
              className="mt-4 w-full py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold font-body flex items-center justify-center gap-2 hover:bg-yellow-500/15 transition-colors"
            >
              <Icon name="Crown" size={14} />
              Получить VIP за 1 200 ₽/мес
            </button>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <div className="text-xs font-display font-semibold text-foreground tracking-wider">БЫСТРЫЙ ДОСТУП</div>
          </div>

          <button
            onClick={onGoHotForecasts}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/30 transition-colors border-b border-border/50 text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <span className="text-base">🔥</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold font-body text-foreground">Горячие прогнозы</div>
              <div className="text-[10px] text-muted-foreground font-body">{isVip ? 'Все прогнозы открыты' : '3 прогноза в сутки'}</div>
            </div>
            <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
          </button>

          <button
            onClick={onGoVip}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/30 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
              <Icon name="Crown" size={14} className="text-yellow-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold font-body text-foreground">VIP подписка</div>
              <div className="text-[10px] text-muted-foreground font-body">{isVip ? 'Активна' : '1 200 ₽/месяц'}</div>
            </div>
            <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
          </button>
        </div>

        {/* Angela message */}
        <div className="flex items-start gap-3 bg-card border border-primary/15 rounded-xl p-4">
          <img
            src={ANGELA_AVATAR}
            alt="Анжела"
            className="w-9 h-9 rounded-full object-cover object-top flex-shrink-0"
          />
          <div>
            <div className="text-xs font-semibold text-primary font-body mb-1">Анжела:</div>
            <p className="text-xs text-muted-foreground font-body leading-relaxed">
              Привет, <span className="text-foreground font-semibold">{nickname}</span>! Рада видеть тебя. Перейди в чат — задай любой вопрос о футболе, и я разберу его детально.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Дней с нами', value: '1', icon: 'Calendar' },
            { label: 'Прогнозов', value: isVip ? '∞' : '3', icon: 'TrendingUp' },
            { label: 'Статус', value: isVip ? 'VIP' : 'FREE', icon: 'Award' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
              <Icon name={s.icon} size={16} className={`mx-auto mb-1 ${s.label === 'Статус' && isVip ? 'text-yellow-400' : 'text-muted-foreground'}`} />
              <div className={`font-display text-lg font-bold ${s.label === 'Статус' && isVip ? 'text-yellow-400' : 'text-foreground'}`}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground font-body">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-destructive/40 hover:text-destructive transition-all font-body text-sm"
        >
          <Icon name="LogOut" size={14} />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}