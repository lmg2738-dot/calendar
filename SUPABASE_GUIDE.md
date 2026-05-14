# Supabase 연동 가이드

AI 스마트 플래너를 Supabase와 연동하려면 다음 단계를 따르세요.

### 1. Supabase 프로젝트 생성 및 URL/API Key 확인
1. [Supabase Console](https://app.supabase.com/)에 접속하여 새 프로젝트를 생성합니다.
2. 프로젝트 대시보드에서 왼쪽 사이드바 맨 아래의 **Settings (톱니바퀴 아이콘)**를 클릭합니다.
3. **API** 메뉴를 선택합니다.
4. **Project API keys** 섹션에서 다음 두 가지 값을 찾습니다:
   - **Project URL**: `https://[your-project-id].supabase.co` 형태
   - **API Key (anon/public)**: `eyJ...` 형태의 긴 문자열

### 2. 환경 변수 설정
AI Studio의 **Settings (설정)** 메뉴에서 다음 환경 변수를 추가하세요:
- `NEXT_PUBLIC_SUPABASE_URL`: 위에서 복사한 **Project URL**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 위에서 복사한 **anon/public Key**

### 3. 데이터베이스 테이블 생성
Supabase 대시보드의 **SQL Editor** 메뉴를 선택하고 `New query`를 클릭한 후 아래 SQL을 실행하여 `events` 테이블을 생성합니다.

```sql
-- 1. UUID 확장 기능 활성화 (이미 되어있을 수 있음)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. events 테이블 생성
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  start TIMESTAMP WITH TIME ZONE NOT NULL,
  "end" TIMESTAMP WITH TIME ZONE NOT NULL,
  priority TEXT DEFAULT 'medium',
  description TEXT,
  is_ai_generated BOOLEAN DEFAULT false,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 만약 이미 테이블이 있는데 특정 컬럼이 없다면 아래 명령어를 각각 실행하세요:
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT false;
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS user_id UUID;

-- 3. Row Level Security (RLS) 비활성화 (테스트용)
-- 실제 배포 시에는 보안을 위해 RLS를 설정해야 합니다.
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
```

### 4. 확인 및 테스트
1. 환경 변수 입력 후 앱을 **Restart (다시 시작)** 합니다.
2. 브라우저 개발자 도구의 콘솔(Console) 탭에서 `Supabase is not configured yet` 메시지가 사라졌는지 확인합니다.
3. 일정을 추가했을 때 Supabase의 **Table Editor -> events** 테이블에 데이터가 들어오는지 확인합니다.

---
**주의:** 테이블 이름이 정확히 `events` (복수형)여야 하며, 컬럼명도 SQL과 일치해야 연동이 가능합니다.
