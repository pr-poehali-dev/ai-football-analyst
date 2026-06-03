CREATE TABLE t_p48871243_ai_football_analyst.reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    rating INTEGER NOT NULL,
    text TEXT NOT NULL,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);