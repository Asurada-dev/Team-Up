CREATE DATABASE teamup;

CREATE TYPE roles AS ENUM('admin', 'user');

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role roles default 'user',
    verification_token TEXT,
    is_verified BOOLEAN default FALSE,
    verified_date DATE,
    password_token TEXT,
    password_token_Expiration_date TIMESTAMP
);

CREATE TABLE IF NOT EXISTS token(
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id INT REFERENCES users(id) NOT NULL,
    refresh_token TEXT NOT NULL,
    ip TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    is_valid BOOLEAN NOT NULL default TRUE
);

CREATE TABLE IF NOT EXISTS movie (id INT PRIMARY, title TEXT);

CREATE TABLE IF NOT EXISTS movie_info (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    movie_id INT REFERENCES movie(id),
    title TEXT,
    title_en TEXT,
    release_date DATE,
    runtime TEXT,
    distributor TEXT,
    imdb REAL,
    img TEXT
);

CREATE TABLE IF NOT EXISTS city (id INT PRIMARY KEY, name TEXT);

CREATE TABLE IF NOT EXISTS theater (
    id INT PRIMARY KEY,
    name TEXT,
    address TEXT,
    tel TEXT,
    city_id INT REFERENCES city(id)
);

CREATE TABLE IF NOT EXISTS movie_schedule (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    movie_id INT REFERENCES movie(id),
    theater_id INT REFERENCES theater(id),
    date DATE,
    time TIME,
    kind TEXT
);

CREATE TYPE activity_role AS ENUM('leader', 'member');

CREATE TABLE IF NOT EXISTS activity(
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT,
    schedule_id INT REFERENCES movie_schedule(id),
    image TEXT,
    description TEXT,
    max_member INT,
    create_time TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_member(
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    activity_id INT REFERENCES activity(id) ON DELETE CASCADE,
    member_id INT REFERENCES users(id),
    role activity_role
);