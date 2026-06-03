"""Регистрация, вход пользователей и admin-панель Angela Football Analyst"""
import json
import os
import hashlib
import secrets
import time
import psycopg2
from psycopg2 import errors as pg_errors
from datetime import datetime, timedelta

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Authorization, X-Admin-Key',
}

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p48871243_ai_football_analyst')

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

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
    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS {SCHEMA}.angela_photos (
            id SERIAL PRIMARY KEY,
            url TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.angela_photos")
    if cur.fetchone()[0] == 0:
        photos = [
            'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/bucket/5884d2d4-4821-4d6c-9720-09b91b15dde1.jpeg',
            'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/files/b071ce36-10c5-4413-b844-276eb1fe8464.jpg',
            'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/files/c5af95da-2176-4a85-ae36-559deee823d6.jpg',
            'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/files/f426b943-271d-48ef-bbd5-8f31ba724c3c.jpg',
            'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/files/ebfaffb3-16d9-478d-bd1d-09fbd9b3cf34.jpg',
            'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/files/eef83ccc-862a-4600-b65f-295e53a0e0f6.jpg',
        ]
        for url in photos:
            cur.execute(f"INSERT INTO {SCHEMA}.angela_photos (url) VALUES ('{url}')")

def hash_password(pwd):
    return hashlib.sha256(pwd.encode()).hexdigest()

def handler(event: dict, context) -> dict:
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

    action = body.get('action', '')
    # also support path-based for compatibility
    path = event.get('path', '/')
    if not action:
        if 'register' in path:
            action = 'register'
        elif 'login' in path:
            action = 'login'
        elif 'me' in path:
            action = 'me'
        elif 'buy-vip' in path:
            action = 'buy-vip'

    conn = get_conn()
    cur = conn.cursor()
    try:
        ensure_tables(cur)
        conn.commit()
    except Exception:
        conn.commit()

    try:
        if action == 'register':
            nickname = (body.get('nickname') or '').strip()
            password = body.get('password') or ''

            if not nickname or len(nickname) < 3:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Никнейм минимум 3 символа'})}
            if not password or len(password) < 6:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Пароль минимум 6 символов'})}

            pw_hash = hash_password(password)
            try:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.users (nickname, password_hash) VALUES (%s, %s) RETURNING id",
                    (nickname, pw_hash)
                )
                user_id = cur.fetchone()[0]
            except pg_errors.UniqueViolation:
                conn.rollback()
                return {'statusCode': 409, 'headers': CORS, 'body': json.dumps({'error': 'Никнейм уже занят'})}

            token = secrets.token_hex(32)
            cur.execute(
                f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)",
                (user_id, token)
            )
            conn.commit()
            return {
                'statusCode': 200, 'headers': CORS,
                'body': json.dumps({'token': token, 'nickname': nickname, 'is_vip': False})
            }

        elif action == 'login':
            nickname = (body.get('nickname') or '').strip()
            password = body.get('password') or ''
            pw_hash = hash_password(password)

            cur.execute(
                f"SELECT id, nickname, is_vip, vip_expires_at FROM {SCHEMA}.users WHERE nickname=%s AND password_hash=%s",
                (nickname, pw_hash)
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Неверный никнейм или пароль'})}

            user_id, nick, is_vip, vip_exp = row
            token = secrets.token_hex(32)
            cur.execute(
                f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)",
                (user_id, token)
            )
            conn.commit()

            is_vip_active = bool(is_vip and (vip_exp is None or vip_exp.timestamp() > time.time()))
            return {
                'statusCode': 200, 'headers': CORS,
                'body': json.dumps({'token': token, 'nickname': nick, 'is_vip': is_vip_active})
            }

        elif action == 'me':
            auth = event.get('headers', {}).get('x-authorization', '')
            token = auth.replace('Bearer ', '')
            cur.execute(
                f"""SELECT u.id, u.nickname, u.is_vip, u.vip_expires_at, u.forecasts_used_today, u.forecasts_reset_at
                    FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id=s.user_id
                    WHERE s.token=%s AND s.expires_at > NOW()""",
                (token,)
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'})}
            uid, nick, is_vip, vip_exp, used, reset_at = row
            import time
            is_vip_active = is_vip and (vip_exp is None or vip_exp.timestamp() > time.time())
            return {
                'statusCode': 200, 'headers': CORS,
                'body': json.dumps({'id': uid, 'nickname': nick, 'is_vip': is_vip_active, 'forecasts_used_today': used})
            }

        elif action == 'buy-vip':
            auth = event.get('headers', {}).get('x-authorization', '')
            token = auth.replace('Bearer ', '')
            cur.execute(
                f"SELECT u.id FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id=s.user_id WHERE s.token=%s AND s.expires_at > NOW()",
                (token,)
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'})}
            uid = row[0]
            cur.execute(
                f"UPDATE {SCHEMA}.users SET is_vip=TRUE, vip_expires_at=NOW()+INTERVAL '30 days' WHERE id=%s",
                (uid,)
            )
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'success': True, 'message': 'VIP активирован на 30 дней'})}

        # --- ADMIN ACTIONS (v4) ---
        elif action in ('admin_list', 'admin_grant_vip', 'admin_revoke_vip'):
            admin_key = body.get('admin_key', '') or event.get('headers', {}).get('x-admin-key', '')
            if admin_key != os.environ.get('ADMIN_KEY', ''):
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Forbidden'})}

            if action == 'admin_list':
                cur.execute(f"""
                    SELECT id, nickname, is_vip, vip_expires_at, created_at,
                           (SELECT COUNT(*) FROM {SCHEMA}.sessions s WHERE s.user_id = u.id AND s.expires_at > NOW()) as active_sessions
                    FROM {SCHEMA}.users u ORDER BY created_at DESC
                """)
                rows = cur.fetchall()
                users_list = []
                now = datetime.utcnow()
                for r in rows:
                    vip_expires = r[3]
                    is_vip_active = bool(r[2]) and (vip_expires is None or vip_expires > now)
                    users_list.append({
                        'id': r[0], 'nickname': r[1],
                        'is_vip': bool(r[2]), 'is_vip_active': is_vip_active,
                        'vip_expires_at': vip_expires.isoformat() if vip_expires else None,
                        'created_at': r[4].isoformat() if r[4] else None,
                        'active_sessions': r[5],
                    })
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'users': users_list})}

            nickname = (body.get('nickname') or '').strip()
            if not nickname:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'nickname required'})}
            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE nickname=%s", (nickname,))
            row = cur.fetchone()
            if not row:
                return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': f'Пользователь «{nickname}» не найден'})}

            if action == 'admin_grant_vip':
                days = int(body.get('days', 30))
                expires = datetime.utcnow() + timedelta(days=days)
                cur.execute(f"UPDATE {SCHEMA}.users SET is_vip=TRUE, vip_expires_at=%s WHERE nickname=%s", (expires, nickname))
                conn.commit()
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
                    'success': True, 'message': f'VIP активирован для «{nickname}» на {days} дней',
                    'expires_at': expires.isoformat(),
                })}

            elif action == 'admin_revoke_vip':
                cur.execute(f"UPDATE {SCHEMA}.users SET is_vip=FALSE, vip_expires_at=NULL WHERE nickname=%s", (nickname,))
                conn.commit()
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'success': True, 'message': f'VIP снят с «{nickname}»'})}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()