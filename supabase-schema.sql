-- Supabase SQL Editor에 붙여넣어 실행하세요.

CREATE TABLE IF NOT EXISTS entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  expectation TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 기존 테이블을 이미 사용 중이었다면 관계 컬럼만 추가합니다.
ALTER TABLE entries ADD COLUMN IF NOT EXISTS relationship TEXT;
UPDATE entries SET relationship = COALESCE(relationship, '') WHERE relationship IS NULL;
ALTER TABLE entries ALTER COLUMN relationship SET NOT NULL;

-- 관리자 외 직접 접근 차단
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- 참고: service role key는 RLS를 우회하므로 서버 라우트에서만 사용하세요.
-- 익명 클라이언트에서 직접 INSERT를 열고 싶다면 아래 정책을 검토하세요.
-- CREATE POLICY "allow insert" ON entries FOR INSERT WITH CHECK (true);
