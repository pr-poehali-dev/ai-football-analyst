import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { apiLogin, apiRegister } from '@/lib/api';
import { saveUser } from '@/lib/auth';

const ANGELA_AVATAR = 'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/files/b3cba21b-b8b7-4945-9402-017eb6079f89.jpg';

interface Props {
  onAuth: (user: { nickname: string; is_vip: boolean; token: string }) => void;
}

export default function AuthPage({ onAuth }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async () => {
    if (!nickname.trim() || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = mode === 'register'
        ? await apiRegister(nickname.trim(), password)
        : await apiLogin(nickname.trim(), password);

      if (res.error) {
        setError(res.error);
      } else {
        const user = { nickname: res.nickname, is_vip: res.is_vip, token: res.token };
        saveUser(user);
        onAuth(user);
      }
    } catch {
      setError('Ошибка соединения. Попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Football field background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 40% at 50% 50%, rgba(74,222,128,0.3) 0%, transparent 70%),
            repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(74,222,128,0.1) 40px, rgba(74,222,128,0.1) 41px),
            repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(74,222,128,0.1) 40px, rgba(74,222,128,0.1) 41px)
          `
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-primary/20 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary/20 rounded-full" />
      </div>

      <div className="w-full max-w-sm mx-4 animate-fade-in">
        {/* Angela */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <img
              src={ANGELA_AVATAR}
              alt="Анжела"
              className="w-20 h-20 rounded-full object-cover object-top border-2 border-primary/40 mx-auto"
            />
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-primary rounded-full border-2 border-background animate-pulse-green" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-wider mt-3">ANGELA</h1>
          <p className="text-xs text-primary font-body mt-1">AI Football Analyst</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6">
          {/* Tabs */}
          <div className="flex rounded-lg bg-secondary p-1 mb-6">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 text-xs font-semibold font-body rounded-md transition-all ${
                  mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                {m === 'login' ? 'Вход' : 'Регистрация'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {/* Nickname */}
            <div>
              <label className="text-xs text-muted-foreground font-body mb-1.5 block">Никнейм</label>
              <div className="flex items-center bg-background border border-border rounded-xl px-3 py-2.5 focus-within:border-primary/50 transition-colors gap-2">
                <Icon name="User" size={14} className="text-muted-foreground flex-shrink-0" />
                <input
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={mode === 'register' ? 'Придумай никнейм' : 'Твой никнейм'}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-body"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-muted-foreground font-body mb-1.5 block">Пароль</label>
              <div className="flex items-center bg-background border border-border rounded-xl px-3 py-2.5 focus-within:border-primary/50 transition-colors gap-2">
                <Icon name="Lock" size={14} className="text-muted-foreground flex-shrink-0" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={mode === 'register' ? 'Минимум 6 символов' : 'Твой пароль'}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-body"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                />
                <button onClick={() => setShowPass(v => !v)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name={showPass ? 'EyeOff' : 'Eye'} size={14} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-xl px-3 py-2.5 animate-fade-in">
                <Icon name="AlertCircle" size={14} className="text-destructive flex-shrink-0" />
                <span className="text-xs text-destructive font-body">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={submit}
              disabled={loading || !nickname.trim() || !password}
              className="w-full bg-primary text-primary-foreground font-semibold font-body py-3 rounded-xl text-sm hover:bg-primary/90 disabled:opacity-40 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></>
              ) : (
                <>{mode === 'login' ? 'Войти' : 'Создать аккаунт'}<Icon name="ArrowRight" size={14} /></>
              )}
            </button>
          </div>
        </div>

        {mode === 'register' && (
          <p className="text-[10px] text-muted-foreground/50 text-center mt-3 font-body leading-relaxed">
            После регистрации Анжела будет обращаться к тебе по никнейму
          </p>
        )}
      </div>
    </div>
  );
}
