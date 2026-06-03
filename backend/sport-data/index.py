"""Получение реальных футбольных данных из API-Football для Анжелы"""
import json
import os
import urllib.request
from datetime import datetime, timezone

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
}

API_HOST = 'v3.football.api-sports.io'

def api_request(endpoint: str, params: dict) -> dict:
    key = os.environ['APIFOOTBALL_KEY']
    query = '&'.join(f'{k}={v}' for k, v in params.items())
    url = f'https://{API_HOST}/{endpoint}?{query}'
    req = urllib.request.Request(url, headers={
        'x-apisports-key': key,
        'x-rapidapi-host': API_HOST,
    })
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read())

def get_fixtures_today() -> list:
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    data = api_request('fixtures', {'date': today, 'timezone': 'Europe/Moscow'})
    return data.get('response', [])

def get_fixture_stats(fixture_id: int) -> dict:
    data = api_request('fixtures/statistics', {'fixture': fixture_id})
    return data.get('response', [])

def get_fixture_lineups(fixture_id: int) -> dict:
    data = api_request('fixtures/lineups', {'fixture': fixture_id})
    return data.get('response', [])

def get_h2h(team1: int, team2: int) -> list:
    data = api_request('fixtures/headtohead', {'h2h': f'{team1}-{team2}', 'last': 5})
    return data.get('response', [])

def get_team_form(team_id: int, league_id: int, season: int) -> dict:
    data = api_request('teams/statistics', {
        'team': team_id, 'league': league_id, 'season': season
    })
    return data.get('response', {})

def get_standings(league_id: int, season: int) -> list:
    data = api_request('standings', {'league': league_id, 'season': season})
    resp = data.get('response', [])
    if resp:
        return resp[0].get('league', {}).get('standings', [])
    return []

def get_injuries(fixture_id: int) -> list:
    data = api_request('injuries', {'fixture': fixture_id})
    return data.get('response', [])

def get_odds(fixture_id: int) -> list:
    data = api_request('odds', {'fixture': fixture_id, 'bookmaker': 8})
    return data.get('response', [])

def get_player_stats(player_id: int, season: int) -> dict:
    data = api_request('players', {'id': player_id, 'season': season})
    resp = data.get('response', [])
    return resp[0] if resp else {}

def format_fixture(f: dict) -> dict:
    fx = f.get('fixture', {})
    home = f.get('teams', {}).get('home', {})
    away = f.get('teams', {}).get('away', {})
    goals = f.get('goals', {})
    score = f.get('score', {})
    league = f.get('league', {})
    status = fx.get('status', {})

    return {
        'fixture_id': fx.get('id'),
        'date': fx.get('date'),
        'status': status.get('short'),
        'status_long': status.get('long'),
        'elapsed': fx.get('status', {}).get('elapsed'),
        'venue': fx.get('venue', {}).get('name'),
        'city': fx.get('venue', {}).get('city'),
        'referee': fx.get('referee'),
        'league_id': league.get('id'),
        'league': league.get('name'),
        'league_country': league.get('country'),
        'league_flag': league.get('flag'),
        'season': league.get('season'),
        'round': league.get('round'),
        'home_team': home.get('name'),
        'home_team_id': home.get('id'),
        'home_logo': home.get('logo'),
        'away_team': away.get('name'),
        'away_team_id': away.get('id'),
        'away_logo': away.get('logo'),
        'score_home': goals.get('home'),
        'score_away': goals.get('away'),
        'halftime': f'{score.get("halftime", {}).get("home", "-")}-{score.get("halftime", {}).get("away", "-")}',
    }

def format_team_form(stats: dict) -> dict:
    if not stats:
        return {}
    form_str = stats.get('form', '')
    fixtures = stats.get('fixtures', {})
    goals = stats.get('goals', {})
    return {
        'form': form_str[-5:] if form_str else '',
        'played': fixtures.get('played', {}).get('total', 0),
        'wins': fixtures.get('wins', {}).get('total', 0),
        'draws': fixtures.get('draws', {}).get('total', 0),
        'losses': fixtures.get('loses', {}).get('total', 0),
        'goals_for': goals.get('for', {}).get('total', {}).get('total', 0),
        'goals_against': goals.get('against', {}).get('total', {}).get('total', 0),
        'clean_sheets': stats.get('clean_sheet', {}).get('total', 0),
        'biggest_win': stats.get('biggest', {}).get('wins', {}).get('home', ''),
    }

def handler(event: dict, context) -> dict:
    """Получение футбольных данных из API-Football: матчи, статистика, H2H, составы, форма, коэффициенты"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'today')

    if action == 'today':
        fixtures = get_fixtures_today()
        result = [format_fixture(f) for f in fixtures]
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'fixtures': result, 'count': len(result)})}

    elif action == 'fixture':
        fixture_id = int(params.get('id', 0))
        stats = get_fixture_stats(fixture_id)
        lineups = get_fixture_lineups(fixture_id)
        odds = get_odds(fixture_id)

        result = {'fixture_id': fixture_id, 'statistics': stats, 'lineups': lineups, 'odds': odds}
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(result)}

    elif action == 'h2h':
        t1 = int(params.get('team1', 0))
        t2 = int(params.get('team2', 0))
        data = get_h2h(t1, t2)
        result = [format_fixture(f) for f in data]
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'h2h': result})}

    elif action == 'form':
        team_id = int(params.get('team', 0))
        league_id = int(params.get('league', 39))
        season = int(params.get('season', datetime.now().year))
        stats = get_team_form(team_id, league_id, season)
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'form': format_team_form(stats)})}

    elif action == 'standings':
        league_id = int(params.get('league', 39))
        season = int(params.get('season', datetime.now().year))
        data = get_standings(league_id, season)
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'standings': data})}

    return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Unknown action'})}
