"""Горячие прогнозы Анжелы — 3 в сутки, обновляются каждые 24 часа"""
import json
import os
import psycopg2
from datetime import datetime

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
}

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p48871243_ai_football_analyst')

SEED_FORECASTS = [
    {
        'home_team': 'Реал Мадрид', 'away_team': 'Барселона', 'league': '🇪🇸 Примера',
        'match_date': 'Сегодня · 22:00',
        'verdict': 'Победа Реала или ничья',
        'prob_home': 45, 'prob_draw': 24, 'prob_away': 31,
        'xg_home': 2.10, 'xg_away': 1.30,
        'confidence': 72, 'risk_level': 'Средний',
        'summary': 'Реал в лучшей форме последних 5 матчей. Мбаппе в огне — 4 гола за 3 игры. Барселона уязвима при контратаках.',
        'arguments': '1. Реал выиграл 3 из 5 домашних встреч с Барсой;2. xG Реала выше 7 матчей подряд;3. Барселона без Гави слабее в центре',
        'changer': 'Травма Мбаппе или удаление в первом тайме',
        'is_hot': True, 'is_vip': False,
    },
    {
        'home_team': 'Манчестер Сити', 'away_team': 'Арсенал', 'league': '🏴 АПЛ',
        'match_date': 'Сегодня · 21:00',
        'verdict': 'Ничья или победа Сити',
        'prob_home': 38, 'prob_draw': 28, 'prob_away': 34,
        'xg_home': 1.90, 'xg_away': 1.70,
        'confidence': 61, 'risk_level': 'Высокий',
        'summary': 'Оба клуба в топ-форме. Арсенал демонстрирует лучший прессинг в АПЛ. Матч равных.',
        'arguments': '1. Арсенал не проигрывает 11 матчей подряд;2. Сити дома потерял очки дважды за месяц;3. PPDA Арсенала лучший в лиге',
        'changer': 'Кто первым откроет счёт — определит тактику',
        'is_hot': True, 'is_vip': False,
    },
    {
        'home_team': 'Бавария', 'away_team': 'Боруссия Д', 'league': '🇩🇪 Бундеслига',
        'match_date': 'Завтра · 19:30',
        'verdict': 'Победа Баварии',
        'prob_home': 52, 'prob_draw': 25, 'prob_away': 23,
        'xg_home': 2.40, 'xg_away': 1.10,
        'confidence': 78, 'risk_level': 'Низкий',
        'summary': 'Бавария доминирует дома. Кейн в абсолютной форме. Боруссия нестабильна в гостях.',
        'arguments': '1. Бавария выиграла 8 из 9 домашних матчей;2. Кейн — 36 голов в сезоне;3. Боруссия без победы в гостях 4 матча',
        'changer': 'Ранние карточки или травма Кейна',
        'is_hot': False, 'is_vip': True,
    },
    {
        'home_team': 'ПСЖ', 'away_team': 'Марсель', 'league': '🇫🇷 Лига 1',
        'match_date': 'Сегодня · 18:45',
        'verdict': 'Победа ПСЖ',
        'prob_home': 61, 'prob_draw': 22, 'prob_away': 17,
        'xg_home': 2.80, 'xg_away': 0.90,
        'confidence': 81, 'risk_level': 'Низкий',
        'summary': 'ПСЖ доминирует в Лиге 1 с огромным отрывом. Марсель в гостях выглядит бледно последние 5 туров.',
        'arguments': '1. ПСЖ выиграл 9 последних домашних матчей;2. xG ПСЖ 2.8 — лучший показатель в лиге;3. Марсель без побед в гостях 3 матча',
        'changer': 'Массовые карточки и усталость от плотного графика',
        'is_hot': True, 'is_vip': False,
    },
    {
        'home_team': 'Интер', 'away_team': 'Милан', 'league': '🇮🇹 Серия А',
        'match_date': 'Завтра · 20:45',
        'verdict': 'Ничья или минимальная победа',
        'prob_home': 38, 'prob_draw': 36, 'prob_away': 26,
        'xg_home': 1.60, 'xg_away': 1.40,
        'confidence': 55, 'risk_level': 'Высокий',
        'summary': 'Дерби della Madonnina — всегда непредсказуемо. Интер чуть лучше по форме, но Милан опасен в контратаках.',
        'arguments': '1. Последние 5 дерби — 3 ничьи;2. Интер лучше по xG дома;3. Милан без 2 ключевых игроков',
        'changer': 'Первый гол полностью изменит картину матча',
        'is_hot': False, 'is_vip': True,
    },
    {
        'home_team': 'Ливерпуль', 'away_team': 'Манчестер Ю', 'league': '🏴 АПЛ',
        'match_date': 'Суббота · 14:30',
        'verdict': 'Победа Ливерпуля',
        'prob_home': 58, 'prob_draw': 22, 'prob_away': 20,
        'xg_home': 2.20, 'xg_away': 0.90,
        'confidence': 74, 'risk_level': 'Средний',
        'summary': 'Ливерпуль в великолепной форме, МЮ переживает кризис. Анфилд создаёт давление.',
        'arguments': '1. Ливерпуль выиграл последние 4 домашних матча с МЮ;2. МЮ — 5-е место по xGA в лиге;3. Салах и Нуньес в полной боевой готовности',
        'changer': 'Ранний гол МЮ изменит всю тактику матча',
        'is_hot': True, 'is_vip': False,
    },
]

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_user_from_token(cur, token):
    if not token:
        return None
    cur.execute(
        f"""SELECT u.id, u.nickname, u.is_vip, u.vip_expires_at, u.forecasts_used_today, u.forecasts_reset_at
            FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id=s.user_id
            WHERE s.token=%s AND s.expires_at > NOW()""",
        (token,)
    )
    return cur.fetchone()

def ensure_tables(cur):
    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS {SCHEMA}.users (
            id SERIAL PRIMARY KEY,
            nickname VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            is_vip BOOLEAN DEFAULT FALSE,
            vip_expires_at TIMESTAMP,
            forecasts_used_today INTEGER DEFAULT 0,
            forecasts_reset_at TIMESTAMP DEFAULT NOW(),
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS {SCHEMA}.sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES {SCHEMA}.users(id) ON DELETE CASCADE,
            token VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days'
        )
    """)
    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS {SCHEMA}.forecasts (
            id SERIAL PRIMARY KEY,
            home_team VARCHAR(100) NOT NULL,
            away_team VARCHAR(100) NOT NULL,
            league VARCHAR(100),
            match_date VARCHAR(50),
            verdict TEXT,
            prob_home INTEGER,
            prob_draw INTEGER,
            prob_away INTEGER,
            xg_home DECIMAL(4,2),
            xg_away DECIMAL(4,2),
            confidence INTEGER,
            risk_level VARCHAR(20),
            summary TEXT,
            arguments TEXT,
            changer TEXT,
            is_hot BOOLEAN DEFAULT TRUE,
            is_vip BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW(),
            valid_until TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
        )
    """)

def ensure_forecasts(cur, conn):
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.forecasts WHERE valid_until > NOW()")
    count = cur.fetchone()[0]
    if count < 3:
        cur.execute(f"SELECT home_team FROM {SCHEMA}.forecasts ORDER BY id DESC LIMIT 3")
        existing = [r[0] for r in cur.fetchall()]
        added = 0
        import random
        seeds = SEED_FORECASTS.copy()
        random.shuffle(seeds)
        for f in seeds:
            if f['home_team'] not in existing and added < 6:
                cur.execute(
                    f"""INSERT INTO {SCHEMA}.forecasts
                        (home_team, away_team, league, match_date, verdict, prob_home, prob_draw, prob_away,
                         xg_home, xg_away, confidence, risk_level, summary, arguments, changer, is_hot, is_vip,
                         valid_until)
                        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s, NOW()+INTERVAL '24 hours')""",
                    (f['home_team'], f['away_team'], f['league'], f['match_date'], f['verdict'],
                     f['prob_home'], f['prob_draw'], f['prob_away'], f['xg_home'], f['xg_away'],
                     f['confidence'], f['risk_level'], f['summary'], f['arguments'], f['changer'],
                     f['is_hot'], f['is_vip'])
                )
                added += 1
        conn.commit()

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    auth = event.get('headers', {}).get('x-authorization', '')
    token = auth.replace('Bearer ', '')

    conn = get_conn()
    cur = conn.cursor()
    try:
        ensure_tables(cur)
        conn.commit()
    except Exception:
        conn.rollback()
    try:
        ensure_forecasts(cur, conn)

        user = get_user_from_token(cur, token)
        import time
        is_vip = user and user[2] and (user[3] is None or user[3].timestamp() > time.time())

        if is_vip:
            cur.execute(
                f"""SELECT id, home_team, away_team, league, match_date, verdict,
                    prob_home, prob_draw, prob_away, xg_home, xg_away,
                    confidence, risk_level, summary, arguments, changer, is_hot, is_vip, valid_until
                    FROM {SCHEMA}.forecasts WHERE valid_until > NOW()
                    ORDER BY is_hot DESC, confidence DESC LIMIT 6"""
            )
        else:
            cur.execute(
                f"""SELECT id, home_team, away_team, league, match_date, verdict,
                    prob_home, prob_draw, prob_away, xg_home, xg_away,
                    confidence, risk_level, summary, arguments, changer, is_hot, is_vip, valid_until
                    FROM {SCHEMA}.forecasts WHERE valid_until > NOW() AND is_vip=FALSE
                    ORDER BY is_hot DESC, confidence DESC LIMIT 3"""
            )

        rows = cur.fetchall()
        forecasts = []
        for r in rows:
            args_list = [a.strip() for a in (r[14] or '').split(';') if a.strip()]
            forecasts.append({
                'id': r[0],
                'home_team': r[1], 'away_team': r[2],
                'league': r[3], 'match_date': r[4],
                'verdict': r[5],
                'prob_home': r[6], 'prob_draw': r[7], 'prob_away': r[8],
                'xg_home': float(r[9]) if r[9] else 0,
                'xg_away': float(r[10]) if r[10] else 0,
                'confidence': r[11], 'risk_level': r[12],
                'summary': r[13], 'arguments': args_list,
                'changer': r[15],
                'is_hot': r[16], 'is_vip': r[17],
                'valid_until': r[18].isoformat() if r[18] else None,
            })

        now = datetime.utcnow()
        cur.execute(
            f"SELECT MIN(valid_until) FROM {SCHEMA}.forecasts WHERE valid_until > NOW()"
        )
        next_update = cur.fetchone()[0]

        return {
            'statusCode': 200, 'headers': CORS,
            'body': json.dumps({
                'forecasts': forecasts,
                'is_vip': bool(is_vip),
                'next_update': next_update.isoformat() if next_update else None,
                'server_time': now.isoformat(),
            })
        }
    except Exception as ex:
        return {'statusCode': 500, 'headers': CORS, 'body': json.dumps({'error': str(ex)})}
    finally:
        cur.close()
        conn.close()