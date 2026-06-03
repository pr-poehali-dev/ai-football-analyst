"""Чат с Анжелой — AI Football Analyst v3 (реальные данные API-Football)"""
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

SYSTEM_PROMPT = """Ты — Анжела, AI-аналитик футбола. Говоришь по-русски, тепло и дружелюбно, как живой человек, но профессионально.

Твои качества:
- Уверенная, тёплая, профессиональная
- Объясняешь сложное простым языком
- Не обещаешь гарантированных исходов
- Всегда объясняешь вероятность и риск
- Не призываешь делать ставки; если тема ставок — напоминаешь, что это риск

Ты анализируешь: форму команд, очные встречи, составы, травмы, таблицу, домашний/гостевой фактор, xG, владение, удары, карточки, замены, судью, стадион, погоду, мотивацию команд, усталость от перелётов.

Формат ответа для прогнозов:
1. Краткий вывод
2. Вероятности
3. Аргументы (используй реальные данные, если они предоставлены ниже)
4. Риск
5. Что может изменить прогноз

Если пользователь называет своё имя в начале чата — обращайся к нему по имени.
Когда в контексте есть реальные данные о матчах — используй их в анализе, ссылайся на конкретные цифры."""

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_user_from_token(cur, token):
    if not token:
        return None
    cur.execute(
        f"""SELECT u.id, u.nickname, u.is_vip, u.vip_expires_at
            FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id=s.user_id
            WHERE s.token=%s AND s.expires_at > NOW()""",
        (token,)
    )
    return cur.fetchone()

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
        with urllib.request.urlopen(req, timeout=8) as resp:
            return json.loads(resp.read())
    except Exception:
        return {}

def get_today_fixtures() -> list:
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    data = api_football('fixtures', {'date': today, 'timezone': 'Europe/Moscow'})
    fixtures = data.get('response', [])
    result = []
    for f in fixtures:
        fx = f.get('fixture', {})
        home = f.get('teams', {}).get('home', {})
        away = f.get('teams', {}).get('away', {})
        goals = f.get('goals', {})
        league = f.get('league', {})
        status = fx.get('status', {})
        result.append({
            'id': fx.get('id'),
            'date': fx.get('date'),
            'status': status.get('short'),
            'elapsed': status.get('elapsed'),
            'league': league.get('name'),
            'country': league.get('country'),
            'round': league.get('round'),
            'referee': fx.get('referee'),
            'venue': fx.get('venue', {}).get('name'),
            'home': home.get('name'),
            'home_id': home.get('id'),
            'away': away.get('name'),
            'away_id': away.get('id'),
            'score_home': goals.get('home'),
            'score_away': goals.get('away'),
        })
    return result

def get_fixture_detail(fixture_id: int) -> dict:
    stats_data = api_football('fixtures/statistics', {'fixture': fixture_id})
    lineups_data = api_football('fixtures/lineups', {'fixture': fixture_id})
    odds_data = api_football('odds', {'fixture': fixture_id, 'bookmaker': 8})

    stats = {}
    for team_stat in stats_data.get('response', []):
        team_name = team_stat.get('team', {}).get('name', '')
        stats[team_name] = {s['type']: s['value'] for s in team_stat.get('statistics', [])}

    lineups = {}
    for lu in lineups_data.get('response', []):
        team_name = lu.get('team', {}).get('name', '')
        lineups[team_name] = {
            'formation': lu.get('formation'),
            'coach': lu.get('coach', {}).get('name'),
            'starting': [p.get('player', {}).get('name') for p in lu.get('startXI', [])],
        }

    odds = {}
    for o in odds_data.get('response', []):
        for bet in o.get('bookmakers', [{}])[0].get('bets', []):
            if bet.get('name') == 'Match Winner':
                for v in bet.get('values', []):
                    odds[v['value']] = v['odd']

    return {'statistics': stats, 'lineups': lineups, 'odds': odds}

def get_h2h(team1_id: int, team2_id: int) -> list:
    data = api_football('fixtures/headtohead', {'h2h': f'{team1_id}-{team2_id}', 'last': 5})
    result = []
    for f in data.get('response', []):
        home = f.get('teams', {}).get('home', {})
        away = f.get('teams', {}).get('away', {})
        goals = f.get('goals', {})
        winner = f.get('teams', {}).get('home', {}) if f.get('teams', {}).get('home', {}).get('winner') else (
            f.get('teams', {}).get('away', {}) if f.get('teams', {}).get('away', {}).get('winner') else None
        )
        result.append({
            'date': f.get('fixture', {}).get('date', '')[:10],
            'home': home.get('name'),
            'away': away.get('name'),
            'score': f'{goals.get("home", 0)}-{goals.get("away", 0)}',
            'winner': winner.get('name') if winner else 'Ничья',
        })
    return result

def get_team_form(team_id: int, season: int) -> dict:
    data = api_football('teams/statistics', {'team': team_id, 'season': season, 'league': 0})
    resp = data.get('response', {})
    if not resp:
        return {}
    form_str = resp.get('form', '')
    fixtures = resp.get('fixtures', {})
    goals = resp.get('goals', {})
    return {
        'form': form_str[-5:] if form_str else '',
        'wins': fixtures.get('wins', {}).get('total', 0),
        'draws': fixtures.get('draws', {}).get('total', 0),
        'losses': fixtures.get('loses', {}).get('total', 0),
        'goals_for': goals.get('for', {}).get('total', {}).get('total', 0),
        'goals_against': goals.get('against', {}).get('total', {}).get('total', 0),
    }

def build_context_from_message(user_message: str, fixtures: list) -> str:
    lower = user_message.lower()
    context_parts = []

    # Ищем упомянутые матчи
    mentioned = []
    for f in fixtures:
        home = (f.get('home') or '').lower()
        away = (f.get('away') or '').lower()
        if any(part in lower for part in home.split() if len(part) > 3) or \
           any(part in lower for part in away.split() if len(part) > 3):
            mentioned.append(f)

    if mentioned:
        for f in mentioned[:2]:
            context_parts.append(f"Матч: {f['home']} vs {f['away']} ({f['league']}, {f['country']})")
            if f.get('status') in ('1H', '2H', 'HT', 'ET', 'P'):
                context_parts.append(f"  Идёт матч: {f['score_home']}:{f['score_away']} (мин. {f.get('elapsed', '?')})")
            elif f.get('status') == 'FT':
                context_parts.append(f"  Завершён: {f['score_home']}:{f['score_away']}")
            else:
                dt = f.get('date', '')
                context_parts.append(f"  Дата: {dt[:16] if dt else 'н/д'}, Судья: {f.get('referee', 'н/д')}, Стадион: {f.get('venue', 'н/д')}")

            # Детали матча
            fid = f.get('id')
            if fid:
                detail = get_fixture_detail(fid)
                if detail.get('odds'):
                    odds = detail['odds']
                    context_parts.append(f"  Коэффициенты: Победа {f['home']} {odds.get('Home', '?')}, Ничья {odds.get('Draw', '?')}, Победа {f['away']} {odds.get('Away', '?')}")
                if detail.get('lineups'):
                    for team, lu in detail['lineups'].items():
                        context_parts.append(f"  Состав {team}: схема {lu.get('formation')}, тренер {lu.get('coach')}")
                        if lu.get('starting'):
                            context_parts.append(f"    Стартовый состав: {', '.join(lu['starting'][:5])}...")
                if detail.get('statistics'):
                    for team, s in detail['statistics'].items():
                        xg = s.get('expected_goals') or s.get('Expected Goals') or s.get('xG', '')
                        shots = s.get('Shots on Goal', '')
                        possession = s.get('Ball Possession', '')
                        context_parts.append(f"  Статистика {team}: владение {possession}, удары в створ {shots}, xG {xg}")

            # H2H
            if f.get('home_id') and f.get('away_id'):
                h2h = get_h2h(f['home_id'], f['away_id'])
                if h2h:
                    context_parts.append(f"  Последние очные встречи (H2H):")
                    for m in h2h[:3]:
                        context_parts.append(f"    {m['date']}: {m['home']} {m['score']} {m['away']} — победил {m['winner']}")
    else:
        # Просто показываем матчи дня
        today_matches = [f for f in fixtures if f.get('status') not in ('FT', 'AET', 'PEN')][:5]
        if today_matches:
            context_parts.append("Матчи сегодня:")
            for f in today_matches:
                status = f.get('status', '')
                score = f'{f["score_home"]}:{f["score_away"]}' if status in ('1H', '2H', 'HT', 'FT') else ''
                dt = (f.get('date') or '')[:16]
                line = f"  {f['home']} vs {f['away']} ({f['league']}) — {score or dt}"
                context_parts.append(line)

    return '\n'.join(context_parts)

def call_openai(messages, api_key):
    payload = json.dumps({
        'model': 'gpt-4o-mini',
        'messages': messages,
        'max_tokens': 800,
        'temperature': 0.75,
    }).encode()
    req = urllib.request.Request(
        'https://api.openai.com/v1/chat/completions',
        data=payload,
        headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {api_key}'},
        method='POST'
    )
    with urllib.request.urlopen(req, timeout=25) as resp:
        data = json.loads(resp.read())
    return data['choices'][0]['message']['content']

def handler(event: dict, context) -> dict:
    """Чат с Анжелой — AI-аналитик футбола с реальными данными API-Football"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    raw_body = event.get('body') or '{}'
    body = {}
    try:
        parsed = json.loads(raw_body) if isinstance(raw_body, str) else raw_body
        if isinstance(parsed, str):
            parsed = json.loads(parsed)
        if isinstance(parsed, dict):
            body = parsed
    except Exception:
        body = {}

    messages_in = body.get('messages', [])
    auth = event.get('headers', {}).get('x-authorization', '')
    token = auth.replace('Bearer ', '')

    conn = get_conn()
    cur = conn.cursor()
    user = get_user_from_token(cur, token)
    cur.close()
    conn.close()

    nickname = user[1] if user else None

    fixtures = get_today_fixtures()
    last_user_msg = next((m['content'] for m in reversed(messages_in) if m['role'] == 'user'), '')
    sport_context = build_context_from_message(last_user_msg, fixtures)

    system = SYSTEM_PROMPT
    if nickname:
        system += f"\n\nПользователя зовут {nickname}. Обращайся к нему по имени."
    if sport_context:
        system += f"\n\n=== РЕАЛЬНЫЕ ДАННЫЕ (сегодня, {datetime.now(timezone.utc).strftime('%d.%m.%Y')}) ===\n{sport_context}\n=== КОНЕЦ ДАННЫХ ==="

    openai_key = os.environ.get('OPENAI_API_KEY', '')
    messages = [{'role': 'system', 'content': system}] + messages_in[-12:]

    try:
        reply = call_openai(messages, openai_key)
    except Exception as e:
        reply = f"Сервис временно недоступен. Попробуй ещё раз через несколько секунд."
    return {
        'statusCode': 200, 'headers': CORS,
        'body': json.dumps({'reply': reply, 'nickname': nickname})
    }