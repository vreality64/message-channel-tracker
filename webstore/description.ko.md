# Message Channel Tracker

메시지 흐름을 깨뜨리지 않고 관찰하세요. MCT는 DevTools 콘솔에 로그를 색상/그룹으로 보기 좋게 정리해 보여줍니다:

- window.postMessage 및 window의 "message" 이벤트
- MessageChannel 생성, MessagePort의 postMessage/수신 메시지
- BroadcastChannel의 postMessage/수신 메시지
- Worker/SharedWorker의 postMessage/수신 메시지
- ServiceWorker의 postMessage/수신 메시지

## 특징
- 비침투적: 읽기 전용 래핑으로 원래 동작 보존
- 시각적 상태: 활성화/비활성화 상태에 따라 확장 아이콘 색상 변경
- 메시지 미리보기: 콘솔 그룹 제목에 메시지 내용의 첫 10글자 표시
- 토글 가능: 확장 팝업에서 켜기/끄기
- Pretty JSON: 항상 활성화된 보기 좋은(JSON) 출력
- 콘솔 중심 UX: 스레드형 그룹, 색상 화살표, 타임스탬프

## 빠른 시작
1. 확장을 설치하고 고정하세요
2. DevTools 콘솔을 엽니다
3. 팝업에서 로깅을 켭니다
4. `window.postMessage("hello from MCT", "*")` 실행

## 권한
- activeTab (사용자 제스처 시 활성 탭에만 일시적 권한)
- scripting (토글 메시지 전송을 위한 작은 헬퍼 주입)

## 소스/문서/플레이그라운드
- 소스: https://github.com/vreality64/message-channel-tracker
- 문서: https://vreality64.github.io/message-channel-tracker/
- Playground: https://vreality64.github.io/message-channel-tracker/playground/
