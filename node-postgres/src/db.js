import pg from 'pg';

// DATABASE_URL points at the Postgres running in this sandbox.
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
