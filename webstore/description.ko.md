# Message Channel Tracker

메시지 흐름을 깨뜨리지 않고 관찰하세요. MCT는 DevTools 콘솔에 로그를 색상/그룹으로 보기 좋게 정리해 보여줍니다:

- window.postMessage 및 window의 "message" 이벤트
- MessageChannel 생성, MessagePort의 postMessage/수신 메시지
- BroadcastChannel의 postMessage/수신 메시지
- Worker/SharedWorker의 postMessage/수신 메시지
- ServiceWorker의 postMessage/수신 메시지

## 특징
- 비침투적: 읽기 전용 래핑으로 원래 동작 보존
- 토글 가능: 확장 팝업에서 켜기/끄기
- Pretty JSON: payload를 보기 좋게 출력하는 옵션(mctPrettyJson)
- 콘솔 중심 UX: 스레드형 그룹, 색상 화살표, 타임스탬프

## 빠른 시작
1. 확장을 설치하고 고정하세요
2. DevTools 콘솔을 엽니다
3. 팝업에서 로깅을 켭니다
4. `window.postMessage("hello from MCT", "*")` 실행

## 권한
- storage, tabs (토글 상태 저장 및 탭별 반영)

## 소스/문서/플레이그라운드
- 소스: https://github.com/vreality64/message-channel-tracker
- 문서: https://vreality64.github.io/message-channel-tracker/
- Playground: https://vreality64.github.io/message-channel-tracker/playground/
