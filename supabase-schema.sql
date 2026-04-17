-- Supabase SQL Editor에 붙여 넣어 실행하세요.

CREATE TABLE IF NOT EXISTS entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  expectation TEXT,
  purchase_type TEXT NOT NULL DEFAULT 'online',
  privacy_agreed BOOLEAN NOT NULL DEFAULT false,
  official_mall_id TEXT,
  order_number TEXT,
  buyer_name TEXT,
  receipt_file_name TEXT,
  receipt_file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 기존 테이블을 이미 사용 중이라면 새 컬럼을 추가합니다.
ALTER TABLE entries ADD COLUMN IF NOT EXISTS relationship TEXT;
UPDATE entries SET relationship = COALESCE(relationship, '') WHERE relationship IS NULL;
ALTER TABLE entries ALTER COLUMN relationship SET NOT NULL;

ALTER TABLE entries ADD COLUMN IF NOT EXISTS purchase_type TEXT NOT NULL DEFAULT 'online';
ALTER TABLE entries ADD COLUMN IF NOT EXISTS privacy_agreed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS official_mall_id TEXT;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS buyer_name TEXT;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS receipt_file_name TEXT;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS receipt_file_path TEXT;
UPDATE entries SET buyer_name = COALESCE(buyer_name, name) WHERE buyer_name IS NULL;

DO $$
BEGIN
  ALTER TABLE entries
    ADD CONSTRAINT entries_purchase_type_check
    CHECK (purchase_type IN ('online', 'offline'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 오프라인 영수증 이미지는 private Storage bucket에 저장합니다.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'entry-receipts',
  'entry-receipts',
  false,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 관리자 외 직접 접근 차단
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- 참고: service role key는 RLS를 우회하므로 서버 라우트에서만 사용하세요.
