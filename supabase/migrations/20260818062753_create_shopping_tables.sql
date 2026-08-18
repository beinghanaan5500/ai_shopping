/*
# Create shopping sessions and recommendations tables

## Purpose
Persist shopping assistant sessions and their ranked product recommendations
so the app can store and retrieve past shopping queries and results.

## New Tables

### shopping_sessions
- `id` (uuid, primary key, auto-generated)
- `query` (text, the original natural-language request)
- `category` (text, extracted product category)
- `max_budget` (numeric, extracted maximum budget, nullable)
- `use_cases` (jsonb, array of use cases)
- `priorities` (jsonb, ordered array of priorities)
- `must_have_specs` (jsonb, object of must-have specifications)
- `created_at` (timestamptz, defaults to now)

### recommendations
- `id` (uuid, primary key, auto-generated)
- `session_id` (uuid, foreign key to shopping_sessions.id, cascade delete)
- `product_id` (integer, DummyJSON product id)
- `product_title` (text)
- `product_price` (numeric)
- `product_rating` (numeric)
- `match_score` (numeric, 0-100 match percentage)
- `score_breakdown` (jsonb, the 5-component score breakdown)
- `reasons` (jsonb, array of match reason objects)
- `created_at` (timestamptz, defaults to now)

## Security
- RLS enabled on both tables.
- This is a single-tenant demo app with no sign-in, so anon + authenticated
  roles are granted full CRUD. Data is intentionally public/shared.
- No user_id columns, no auth.uid() checks.

## Notes
1. Both tables use gen_random_uuid() for primary keys.
2. recommendations has ON DELETE CASCADE on session_id FK so deleting a session
   automatically removes its recommendations.
3. Index on recommendations.session_id for efficient lookups.
*/

CREATE TABLE IF NOT EXISTS shopping_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  category text,
  max_budget numeric,
  use_cases jsonb DEFAULT '[]'::jsonb,
  priorities jsonb DEFAULT '[]'::jsonb,
  must_have_specs jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shopping_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_crud_shopping_sessions" ON shopping_sessions;
CREATE POLICY "anon_select_shopping_sessions" ON shopping_sessions FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_shopping_sessions" ON shopping_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_shopping_sessions" ON shopping_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_shopping_sessions" ON shopping_sessions FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES shopping_sessions(id) ON DELETE CASCADE,
  product_id integer,
  product_title text,
  product_price numeric,
  product_rating numeric,
  match_score numeric,
  score_breakdown jsonb DEFAULT '{}'::jsonb,
  reasons jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_recommendations" ON recommendations;
CREATE POLICY "anon_select_recommendations" ON recommendations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_recommendations" ON recommendations;
CREATE POLICY "anon_insert_recommendations" ON recommendations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_recommendations" ON recommendations;
CREATE POLICY "anon_update_recommendations" ON recommendations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_recommendations" ON recommendations;
CREATE POLICY "anon_delete_recommendations" ON recommendations FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_recommendations_session_id
  ON recommendations(session_id);
