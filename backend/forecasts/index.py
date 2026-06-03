"""Горячие прогнозы Анжелы — реальные матчи из API-Football + анализ GPT"""
import json
import os
import psycopg2
import urllib.request
from datetime import datetime, timezone

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
}

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p48871243_ai_football_analyst')
API_HOST = 'v3.football.api-sports.io'

# Топовые лиги для прогнозов
TOP_LEAGUES = [39, 140, 135, 78, 61, 2, 3, 848]  # АПЛ, Примера, Серия А, Бундеслига, Лига 1, ЛЧ, ЛЕ, ЛК


def api_football(endpoint: str, params: dict) -> dict:
    key = os.environ.get('APIFOOTBALL_KEY', '')
    if not key:
        return {}
    query = '&'.join(f'{k}={v}' for k, v in params.items())
    url = f'https://{API_HOST}/{endpoint}?{query}'
    req = urllib.request.Request(url, headers={
        'x-apisports-key': key,
        'x-rapidapi-host': API_HOST,
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read())
    except Exception:
        return {}


def fetch_upcoming_fixtures() -> list:
    """Получаем предстоящие матчи топ-лиг на ближайшие 2 дня"""
    from datetime import timedelta
    today = datetime.now(timezone.utc)
    results = []
    for delta in range(2):
        day = (today + timedelta(days=delta)).strftime('%Y-%m-%d')
        data = api_football('fixtures', {'date': day, 'timezone': 'Europe/Moscow'})
        for f in data.get('response', []):
            league_id = f.get('league', {}).get('id')
            if league_id in TOP_LEAGUES:
                results.append(f)
    return results


def get_odds_for_fixture(fixture_id: int) -> dict:
    data = api_football('odds', {'fixture': fixture_id, 'bookmaker': 8})
    for o in data.get('response', []):
        for bm in o.get('bookmakers', []):
            for bet in bm.get('bets', []):
                if bet.get('name') == 'Match Winner':
                    odds = {}
                    for v in bet.get('values', []):
                        odds[v['value']] = float(v['odd'])
                    return odds
    return {}


def get_h2h(team1_id: int, team2_id: int) -> list:
    data = api_football('fixtures/headtohead', {'h2h': f'{team1_id}-{team2_id}', 'last': 5})
    result = []
    for f in data.get('response', []):
        home = f.get('teams', {}).get('home', {})
        away = f.get('teams', {}).get('away', {})
        goals = f.get('goals', {})
        home_win = home.get('winner')
        away_win = away.get('winner')
        winner = home.get('name') if home_win else (away.get('name') if away_win else 'Ничья')
        result.append({
            'date': f.get('fixture', {}).get('date', '')[:10],
            'home': home.get('name'), 'away': away.get('name'),
            'score': f'{goals.get("home", 0)}-{goals.get("away", 0)}',
            'winner': winner,
        })
    return result


def odds_to_probs(odds: dict) -> tuple:
    home_o = odds.get('Home', 0)
    draw_o = odds.get('Draw', 0)
    away_o = odds.get('Away', 0)
    if not (home_o and draw_o and away_o):
        return 34, 33, 33
    total = 1/home_o + 1/draw_o + 1/away_o
    ph = round((1/home_o) / total * 100)
    pd = round((1/draw_o) / total * 100)
    pa = 100 - ph - pd
    return ph, pd, pa


def generate_forecast_with_gpt(fixture: dict, h2h: list, odds: dict) -> dict:
    """Генерируем прогноз через GPT на основе реальных данных"""
    openai_key = os.environ.get('OPENAI_API_KEY', '')
    if not openai_key:
        return None

    fx = fixture.get('fixture', {})
    home = fixture.get('teams', {}).get('home', {})
    away = fixture.get('teams', {}).get('away', {})
    league = fixture.get('league', {})
    dt = fx.get('date', '')[:16]

    h2h_text = '\n'.join([f"  {m['date']}: {m['home']} {m['score']} {m['away']} (победил: {m['winner']})" for m in h2h]) if h2h else '  нет данных'
    odds_text = f"Победа {home.get('name')}: {odds.get('Home','?')}, Ничья: {odds.get('Draw','?')}, Победа {away.get('name')}: {odds.get('Away','?')}" if odds else 'нет данных'

    prompt = f"""Сделай краткий прогноз на матч для сайта со ставками. Отвечай ТОЛЬКО валидным JSON без markdown.

Матч: {home.get('name')} vs {away.get('name')}
Лига: {league.get('name')}, {league.get('country')}
Дата: {dt}
Коэффициенты букмекеров: {odds_text}
Последние очные встречи (H2H):
{h2h_text}

Верни JSON строго в таком формате:
{{
  "verdict": "краткий вывод 4-6 слов",
  "summary": "2-3 предложения анализа с опорой на реальные данные",
  "arguments": ["аргумент 1", "аргумент 2", "аргумент 3"],
  "changer": "что может изменить прогноз",
  "xg_home": 1.5,
  "xg_away": 1.2,
  "confidence": 68,
  "risk_level": "Средний",
  "is_hot": true
}}

risk_level: Низкий / Средний / Высокий
confidence: 50-90
is_hot: true если матч топовый или интересный"""

    payload = json.dumps({
        'model': 'gpt-4o-mini',
        'messages': [{'role': 'user', 'content': prompt}],
        'max_tokens': 400,
        'temperature': 0.7,
    }).encode()
    req = urllib.request.Request(
        'https://api.openai.com/v1/chat/completions',
        data=payload,
        headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {openai_key}'},
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read())
        content = data['choices'][0]['message']['content'].strip()
        if content.startswith('```'):
            content = content.split('```')[1]
            if content.startswith('json'):
                content = content[4:]
        return json.loads(content)
    except Exception:
        return None


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
    if count >= 3:
        return

    cur.execute(f"SELECT home_team FROM {SCHEMA}.forecasts ORDER BY id DESC LIMIT 10")
    existing = [r[0] for r in cur.fetchall()]
    added = 0

    # Пробуем получить реальные матчи
    real_fixtures = fetch_upcoming_fixtures()
    import random
    random.shuffle(real_fixtures)

    for fixture in real_fixtures:
        if added >= 6:
            break
        home = fixture.get('teams', {}).get('home', {})
        away = fixture.get('teams', {}).get('away', {})
        if home.get('name') in existing:
            continue

        fx = fixture.get('fixture', {})
        league = fixture.get('league', {})
        dt = fx.get('date', '')
        match_date_str = ''
        try:
            dt_obj = datetime.fromisoformat(dt.replace('Z', '+00:00'))
            today = datetime.now(timezone.utc).date()
            if dt_obj.date() == today:
                match_date_str = f"Сегодня · {dt_obj.strftime('%H:%M')}"
            else:
                match_date_str = dt_obj.strftime('%d.%m · %H:%M')
        except Exception:
            match_date_str = dt[:16] if dt else 'TBD'

        fixture_id = fx.get('id')
        odds = get_odds_for_fixture(fixture_id) if fixture_id else {}
        h2h = get_h2h(home.get('id', 0), away.get('id', 0))
        ph, pd, pa = odds_to_probs(odds)

        # Флаг VIP — каждый второй матч
        is_vip = (added % 2 == 1)

        gpt_result = generate_forecast_with_gpt(fixture, h2h, odds)
        if gpt_result:
            verdict = gpt_result.get('verdict', 'Анализ матча')
            summary = gpt_result.get('summary', '')
            args_list = gpt_result.get('arguments', [])
            arguments_str = ';'.join(args_list)
            changer = gpt_result.get('changer', '')
            xg_home = gpt_result.get('xg_home', 1.5)
            xg_away = gpt_result.get('xg_away', 1.2)
            confidence = gpt_result.get('confidence', 65)
            risk_level = gpt_result.get('risk_level', 'Средний')
            is_hot = gpt_result.get('is_hot', True)
        else:
            verdict = f'Матч: {home.get("name")} — {away.get("name")}'
            summary = f'Матч {league.get("name")}, {league.get("country")}. Данные из реальной базы.'
            arguments_str = f'{home.get("name")} vs {away.get("name")};Лига: {league.get("name")}'
            changer = 'Травмы ключевых игроков'
            xg_home, xg_away = 1.5, 1.2
            confidence = 60
            risk_level = 'Средний'
            is_hot = True

        country = league.get('country', '')
        flag_map = {'England': '🏴', 'Spain': '🇪🇸', 'Germany': '🇩🇪', 'France': '🇫🇷', 'Italy': '🇮🇹',
                    'Russia': '🇷🇺', 'Netherlands': '🇳🇱', 'Portugal': '🇵🇹', 'Turkey': '🇹🇷'}
        flag = flag_map.get(country, '🌍')
        league_name = f'{flag} {league.get("name", "")}'

        cur.execute(
            f"""INSERT INTO {SCHEMA}.forecasts
                (home_team, away_team, league, match_date, verdict, prob_home, prob_draw, prob_away,
                 xg_home, xg_away, confidence, risk_level, summary, arguments, changer, is_hot, is_vip,
                 valid_until)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s, NOW()+INTERVAL '20 hours')""",
            (home.get('name'), away.get('name'), league_name, match_date_str, verdict,
             ph, pd, pa, xg_home, xg_away, confidence, risk_level, summary, arguments_str,
             changer, is_hot, is_vip)
        )
        added += 1

    # Если реальных матчей не нашли — используем seed
    if added == 0:
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