# Changesets

이 폴더에는 변경사항이 머지될 때까지 임시로 저장되는 changeset 노트들이 쌓입니다.

- `pnpm run changeset` 으로 새 changeset을 추가하세요
- main에 머지되면 GitHub Actions가 릴리즈 PR을 자동으로 생성합니다
- 릴리즈 PR이 머지되면 `CHANGELOG.md`와 버전이 업데이트됩니다
