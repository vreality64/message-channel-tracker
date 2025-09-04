# Message Channel Tracker

[English](README.md) | 한국어

## 링크
- Docs: https://vreality64.github.io/message-channel-tracker/
- Playground: https://vreality64.github.io/message-channel-tracker/playground/

## 설명

브라우저 페이지에서 발생하는 메시지 흐름을 깨뜨리지 않고 관찰할 수 있는 Chrome 확장입니다. 다음을 그룹/컬러로 보기 좋게 DevTools 콘솔에 로깅합니다:
- `window.postMessage` 호출과 `window`의 `message` 이벤트
- `MessageChannel` 생성 및 `MessagePort`의 postMessage/수신 메시지
- `BroadcastChannel`의 postMessage/수신 메시지
- `Worker`/`SharedWorker`의 postMessage/수신 메시지
- `ServiceWorker` 인스턴스의 postMessage 및 수신 메시지

켜기/끄기 토글 상태는 `chrome.storage.sync`의 `mctEnabled` 키에 보관됩니다.

## 빠른 시작
- macOS에서 다음으로 확장 관리 페이지를 엽니다:
```bash
./scripts/dev.sh
```
- Chrome에서:
  - 우상단 Developer mode를 켭니다
  - "Load unpacked"를 눌러 프로젝트의 `extension/` 폴더를 선택합니다
  - 확장을 고정(pin)하고 아이콘을 눌러 On/Off를 전환합니다

## Playground (테스트 페이지)
로컬에서 모든 메시지 채널을 손쉽게 테스트하려면 내장된 플레이그라운드를 사용하세요.

1) 간단한 정적 서버 실행:
```bash
./scripts/serve.sh 5173
```
2) 브라우저에서 `http://localhost:5173/playground/` 접속
3) DevTools 콘솔을 열고, 확장 팝업으로 로깅 토글을 On으로 전환
4) 각 카드의 버튼들을 눌러 다음을 체험하세요:
   - window.postMessage (self/iframe/cross-origin)
   - MessageChannel/MessagePort
   - BroadcastChannel
   - Worker/SharedWorker
   - Service Worker

파일 구성:
- `playground/index.html`: 데모 UI
- `playground/playground.js`: 상호작용 스크립트
- `playground/iframe.html`: 자식 프레임 응답 데모
- `playground/worker.js`: Dedicated Worker 에코
- `playground/shared-worker.js`: SharedWorker 에코/브로드캐스트
- `playground/sw.js`: Service Worker 에코/브로드캐스트

## 동작 확인
아무 페이지의 DevTools 콘솔에서 아래를 실행하면 콘솔에 MCT 로그가 출력됩니다.
```js
window.postMessage("hello from MCT", "*");
```

## 파일 구조와 역할
- `extension/manifest.json`: 확장 설정(Manifest v3). `content.js`를 모든 페이지에 주입하고, 팝업(`popup.html`)과 `tracker.js`를 웹 접근 리소스로 노출합니다.
- `extension/content.js`: 페이지에 `tracker.js`를 삽입하고 저장된 토글 상태를 전달. 팝업에서 오는 `MCT:SET_ENABLED` 메시지를 페이지로 중계합니다.
- `extension/tracker.js`: 실제 계측 로직(페이지 컨텍스트). 다음을 래핑/로깅합니다.
  - `window.postMessage`/`window`의 `message` 이벤트
  - `MessagePort`/`MessageChannel`
  - `BroadcastChannel`
  - `Worker`/`SharedWorker`
  - `ServiceWorker` 메시지
  콘솔 그룹과 색상 스타일을 사용해 읽기 좋게 출력하며, `MCT:SET_ENABLED`로 토글합니다.
- `extension/popup.html`, `extension/popup.js`, `extension/popup.css`: 팝업 토글 UI. `chrome.storage.sync`에 상태를 저장하고, 현재 탭의 `content.js`로 토글 메시지를 전송합니다.
- `scripts/dev.sh`: 개발 편의 스크립트. Chrome 확장 관리 페이지를 열고 로드 경로 안내를 표시합니다.
- `README-QUICKSTART.txt`: 수동 로드 절차와 로깅 대상 요약.

## 권한
- `activeTab`
- `scripting`

## 주의 사항
- 로깅은 읽기 전용이며 원래 동작을 변경하지 않도록 설계되었습니다.
- Content script 샌드박스 제약을 피하기 위해 `tracker.js`를 페이지 컨텍스트에 주입합니다.

## 옵션

### Pretty JSON (`mctPrettyJson`)
- 확장 팝업에서 "Pretty JSON" 옵션으로 토글할 수 있습니다.
- 활성화 시 사용자 제공 payload 중심으로 출력하며, JSON을 보기 좋게 정리합니다:
  - JSON 형태의 문자열은 `JSON.parse`를 시도해 객체로 변환
  - 객체/배열은 `JSON.stringify(value, null, 2)`로 들여쓰기 출력
- 비활성화 시 별도 포매팅 없이 인라인으로 표시합니다.
- 설정은 `chrome.storage.sync`의 `mctPrettyJson` 키로 저장되며 탭 전체에 적용됩니다. 변경 즉시 반영됩니다.
