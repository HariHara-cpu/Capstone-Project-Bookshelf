CREATE DATABASE books;

CREATE TABLE readBooks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100),
    rating INT CHECK (rating >= 0 AND rating <= 10),
    notes TEXT,
    read_date DATE,
    isbn VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);