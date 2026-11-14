import pg from 'pg';

// DATABASE_URL points at the Postgres running in this sandbox. It allows 20 connections, and the tests,
// the shift replay and psql need some of them too.
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
