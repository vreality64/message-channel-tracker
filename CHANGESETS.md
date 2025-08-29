# Changesets를 활용한 버전 관리 및 릴리즈

이 프로젝트는 [Changesets](https://github.com/changesets/changesets)를 사용하여 자동 버전 관리와 릴리즈 노트 생성을 관리합니다.

## 🚀 빠른 시작

### 1. 변경사항 추가
```bash
# 변경사항을 설명하는 changeset 생성
pnpm run changeset
```

### 2. 버전 업데이트
```bash
# changeset을 기반으로 버전 업데이트
pnpm run version
```

### 3. 릴리즈 생성
```bash
# 버전 업데이트 + 빌드 + ZIP 패키징
pnpm run release
```

## 📋 상세 사용법

### Changeset 생성
```bash
pnpm run changeset
```

이 명령어를 실행하면:
1. 변경사항 유형 선택 (major/minor/patch)
2. 변경사항 설명 입력
3. `.changeset/` 디렉토리에 마크다운 파일 생성

### 버전 업데이트
```bash
pnpm run version
```

이 명령어는:
1. 모든 changeset을 읽음
2. semantic versioning 규칙에 따라 버전 업데이트
3. `package.json`과 `extension/manifest.json` 자동 동기화
4. CHANGELOG.md 자동 생성

### 릴리즈 생성
```bash
pnpm run release
```

이 명령어는:
1. `pnpm run version` 실행
2. `pnpm run sync:version` 실행
3. `pnpm run build:extension` 실행
4. ZIP 패키징 자동 생성

## 🔄 GitHub Actions 워크플로우

### 자동 릴리즈 프로세스
1. **main 브랜치에 push** → GitHub Actions 트리거
2. **Changesets 확인** → 변경사항이 있으면 자동 처리
3. **릴리즈 PR 생성** → 변경사항 검토 후 머지
4. **자동 태그 생성** → 릴리즈 버전 태그
5. **ZIP 패키징** → 확장프로그램 배포 파일 자동 생성

### 워크플로우 파일
- `.github/workflows/release.yml` - 자동 릴리즈 워크플로우

## 📁 프로젝트 구조

```
.changeset/           # Changesets 설정 및 변경사항
├── config.json      # Changesets 설정
└── README.md        # Changesets 사용법

.github/workflows/    # GitHub Actions
└── release.yml      # 자동 릴리즈 워크플로우

scripts/
└── sync-version.js  # 버전 동기화 스크립트

CHANGELOG.md          # 자동 생성되는 릴리즈 노트
```

## 🎯 버전 관리 규칙

### Semantic Versioning
- **Major (1.0.0 → 2.0.0)**: 호환되지 않는 API 변경
- **Minor (1.0.0 → 1.1.0)**: 새로운 기능 추가 (하위 호환)
- **Patch (1.0.0 → 1.0.1)**: 버그 수정 (하위 호환)

### 자동 동기화
- `package.json` 버전 변경 시 `extension/manifest.json` 자동 동기화
- 모든 버전 관련 파일이 일관성 유지

## 💡 모범 사례

### 1. 기능 개발 시
```bash
# 1. 기능 개발 완료
git add .
git commit -m "feat: Add new message tracking feature"

# 2. Changeset 생성
pnpm run changeset
# - minor 선택
# - "Add new message tracking feature" 입력

# 3. 커밋 및 푸시
git add .
git commit -m "chore: Add changeset for new feature"
git push origin main
```

### 2. 버그 수정 시
```bash
# 1. 버그 수정 완료
git add .
git commit -m "fix: Resolve message port tracking issue"

# 2. Changeset 생성
pnpm run changeset
# - patch 선택
# - "Fix message port tracking issue" 입력

# 3. 커밋 및 푸시
git add .
git commit -m "chore: Add changeset for bug fix"
git push origin main
```

### 3. 수동 릴리즈 시
```bash
# 1. 버전 업데이트
pnpm run version

# 2. 릴리즈 생성
pnpm run release

# 3. 커밋 및 푸시
git add .
git commit -m "chore: Release v1.1.0"
git push origin main
```

## 🔧 문제 해결

### Changeset이 생성되지 않는 경우
```bash
# 의존성 재설치
pnpm install

# Changesets 재초기화
rm -rf .changeset
pnpm changeset init
```

### 버전 동기화 문제
```bash
# 수동 버전 동기화
pnpm run sync:version

# package.json과 manifest.json 버전 확인
cat package.json | grep version
cat extension/manifest.json | grep version
```

## 📚 추가 리소스

- [Changesets 공식 문서](https://github.com/changesets/changesets)
- [Semantic Versioning](https://semver.org/)
- [GitHub Actions](https://docs.github.com/en/actions)
