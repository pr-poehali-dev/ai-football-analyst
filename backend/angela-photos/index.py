"""Фотографии Анжелы — каждый раз новое фото без повторений для пользователя"""
import json
import random

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
}

PHOTOS = [
    'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/files/b3cba21b-b8b7-4945-9402-017eb6079f89.jpg',
    'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/files/b071ce36-10c5-4413-b844-276eb1fe8464.jpg',
    'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/files/c5af95da-2176-4a85-ae36-559deee823d6.jpg',
    'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/files/f426b943-271d-48ef-bbd5-8f31ba724c3c.jpg',
    'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/files/ebfaffb3-16d9-478d-bd1d-09fbd9b3cf34.jpg',
    'https://cdn.poehali.dev/projects/b5ba154b-3ca7-46f5-b777-9707c73ee985/files/eef83ccc-862a-4600-b65f-295e53a0e0f6.jpg',
]

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    raw_body = event.get('body') or '{}'
    try:
        body = json.loads(raw_body) if isinstance(raw_body, str) else (raw_body or {})
    except Exception:
        body = {}
    shown = body.get('shown', []) if isinstance(body, dict) else []

    available = [p for p in PHOTOS if p not in shown]
    if not available:
        available = PHOTOS

    photo = random.choice(available)

    return {
        'statusCode': 200, 'headers': CORS,
        'body': json.dumps({'url': photo, 'remaining': len(available) - 1})
    }