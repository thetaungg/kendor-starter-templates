-- Runs once, after the database is created. Grades run it again on a fresh database.
CREATE TABLE todos (
    id serial PRIMARY KEY,
    title text NOT NULL,
    done boolean NOT NULL DEFAULT false
);

INSERT INTO todos (title, done) VALUES
    ('Read the brief', true),
    ('Write the first endpoint', false);
