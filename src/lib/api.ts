const URLS = {
  auth: 'https://functions.poehali.dev/126ea50d-7c26-45ab-ba81-cf8c76bf2dc8',
  forecasts: 'https://functions.poehali.dev/ff5b1377-20b0-408d-8d59-e3c0e8513e8f',
  chat: 'https://functions.poehali.dev/e504a2ba-1b8e-4f0d-8883-393e7ffc06e1',
  photos: 'https://functions.poehali.dev/76ad174b-cf1b-402e-860d-7dee7e767fb1',
  reviews: 'https://functions.poehali.dev/126ea50d-7c26-45ab-ba81-cf8c76bf2dc8',
};

function getToken() {
  return localStorage.getItem('angela_token') || '';
}

function authHeaders() {
  const t = getToken();
  return t ? { 'Content-Type': 'application/json', 'X-Authorization': `Bearer ${t}` } : { 'Content-Type': 'application/json' };
}

export async function apiRegister(nickname: string, password: string) {
  const r = await fetch(URLS.auth, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'register', nickname, password }),
  });
  return r.json();
}

export async function apiLogin(nickname: string, password: string) {
  const r = await fetch(URLS.auth, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', nickname, password }),
  });
  return r.json();
}

export async function apiMe() {
  const r = await fetch(URLS.auth, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'me', token: getToken() }),
  });
  return r.json();
}

export async function apiBuyVip() {
  const r = await fetch(URLS.auth, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'buy-vip', token: getToken() }),
  });
  return r.json();
}

export async function apiForecasts() {
  const r = await fetch(URLS.forecasts + '?token=' + getToken(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return r.json();
}

export async function apiChat(messages: { role: string; content: string }[]) {
  const r = await fetch(URLS.chat, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ messages }),
  });
  return r.json();
}

export async function apiOwnerList() {
  const r = await fetch(URLS.auth, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'owner_list', token: getToken() }),
  });
  return r.json();
}

export async function apiOwnerGrantVip(nickname: string, days: number) {
  const r = await fetch(URLS.auth, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'owner_grant_vip', nickname, days, token: getToken() }),
  });
  return r.json();
}

export async function apiOwnerRevokeVip(nickname: string) {
  const r = await fetch(URLS.auth, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'owner_revoke_vip', nickname, token: getToken() }),
  });
  return r.json();
}

export async function apiReviewsList() {
  const r = await fetch(URLS.reviews, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reviews_list' }) });
  return r.json();
}
export async function apiReviewsAdd(rating: number, text: string) {
  const r = await fetch(URLS.reviews, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reviews_add', rating, text, token: getToken() }) });
  return r.json();
}
export async function apiReviewsOwnerList() {
  const r = await fetch(URLS.reviews, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reviews_owner_list', token: getToken() }) });
  return r.json();
}
export async function apiReviewsHide(id: number) {
  const r = await fetch(URLS.reviews, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reviews_hide', id, token: getToken() }) });
  return r.json();
}
export async function apiReviewsEdit(id: number, text: string, rating: number) {
  const r = await fetch(URLS.reviews, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reviews_edit', id, text, rating, token: getToken() }) });
  return r.json();
}

export async function apiGetPhoto(shown: string[]) {
  const r = await fetch(URLS.photos, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shown }),
  });
  return r.json();
}