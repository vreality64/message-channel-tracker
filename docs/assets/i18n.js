(() => {
  const messages = {
    en: {
      // Main page
      "brand.title": "Message Channel Tracker",
      "nav.features": "Features",
      "nav.install": "Install",
      "nav.usage": "Usage",
      "nav.how": "How it works",
      "nav.faq": "FAQ",
      "hero.kicker": "Chrome extension",
      "hero.title.pre": "Message channel",
      "hero.title.mid": "flow",
      "hero.title.post": "Observe without breaking",
      "hero.lead":
        "Visualize messages from window.postMessage, MessageChannel, BroadcastChannel, and Worker/ServiceWorker in your DevTools console with colors and groups.",
      "hero.badge1": "Non‑intrusive",
      "hero.badge2": "Toggleable",
      "hero.badge3": "Read‑only",
      "hero.cta1": "Get started",
      "hero.cta2": "View on GitHub",
      "features.title": "Why MCT?",
      "features.f1.title": "Observe multiple channels",
      "features.f1.desc":
        "window.postMessage, MessageChannel/MessagePort, BroadcastChannel, Worker/SharedWorker, ServiceWorker — all at once.",
      "features.f2.title": "Optimized for console",
      "features.f2.desc": "Thread‑like grouping and colors make flows easy to follow.",
      "features.f3.title": "Safe read‑only",
      "features.f3.desc": "Non‑intrusive wrapping that doesn't alter original behavior.",
      "features.f4.title": "State toggles",
      "features.f4.desc":
        "Enable/disable from the popup; global state persists in chrome.storage.sync.",
      "install.title": "Quick Start",
      "install.s1": "Enter <code>chrome://extensions</code> in the address bar",
      "install.s2": "Enable <strong>Developer mode</strong>",
      "install.s3":
        "Click <strong>Load unpacked</strong> and select the <code>extension/</code> folder",
      "install.s4": "Pin the extension icon, then toggle logging on/off.",
      "install.note": "Use manual load until it's published to the Web Store.",
      "usage.title": "Usage",
      "usage.desc": "Run this in any page's DevTools console. MCT logs will appear.",
      "usage.copy": "Copy",
      "usage.note":
        "To try multiple channels at once, use the local <strong>Playground</strong>. Run <code>pnpm run docs</code> then open <code>/playground/</code>.",
      "how.title": "How it works",
      "how.l1":
        "<code>content.js</code> injects <code>tracker.js</code> to safely wrap native objects in the page context.",
      "how.l2": "Messages are organized into console output with colors and groups.",
      "how.l3": "Logging is controlled by toggle events (<code>MCT:SET_ENABLED</code>).",
      "how.l4": "Read‑only design that doesn't modify original behavior.",
      "how.perms": "Required permissions: <code>storage</code>, <code>tabs</code>",
      "how.note.title": "Note",
      "how.note.body":
        "In high‑volume environments, enable only when needed or use console filtering.",
      "faq.title": "FAQ",
      "faq.q1": "Does it impact performance?",
      "faq.a1":
        "It's built to minimize overhead for typical development/debugging. In high‑volume cases, turn logging off to reduce load.",
      "faq.q2": "Is it okay to use on production pages?",
      "faq.a2":
        "Recommended for development/testing. In production, enable it only when necessary.",
      "faq.q3": "What do you log?",
      "faq.a3":
        "We handle postMessage and message events for window.postMessage, MessageChannel/MessagePort, BroadcastChannel, Worker/SharedWorker, and ServiceWorker.",
      "header.h1": "Message Channel Tracker — Playground",
      "header.theme": "Theme",
      "header.clear": "Clear",
      "header.desc":
        "You can see messages directly in the console area below. Use the extension popup to toggle logging.",
      "btn.post_self": "Post to self",
      "btn.post_iframe": "Post to iframe",
      "btn.post_xorigin": "Post to cross-origin",
      "note.post": "Uses window.postMessage and listens for message events.",
      "btn.mc_init": "Init channel",
      "btn.mc_ping": "Ping via ports",
      "note.mc": "Creates a channel, transfers ports, and bounces messages.",
      "btn.bc_open": "Open channels",
      "btn.bc_send": "Send broadcast",
      "note.bc": "Opens two channels with the same name and exchanges messages.",
      "btn.worker_start": "Start worker",
      "btn.worker_ping": "Ping worker",
      "note.worker": "Spawns a dedicated worker, sends/receives messages.",
      "btn.shared_start": "Start SharedWorker",
      "btn.shared_ping": "Ping SharedWorker",
      "note.shared": "Connects to a shared worker via MessagePort.",
      "btn.sw_register": "Register SW",
      "btn.sw_ping": "Ping SW",
      "note.sw": "Registers a service worker and exchanges messages.",
      "console.title": "Console",
    },
    ko: {
      // Main page
      "brand.title": "Message Channel Tracker",
      "nav.features": "기능",
      "nav.install": "설치",
      "nav.usage": "사용법",
      "nav.how": "동작 원리",
      "nav.faq": "FAQ",
      "hero.kicker": "Chrome 확장",
      "hero.title.pre": "메시지 채널",
      "hero.title.mid": "흐름을",
      "hero.title.post": "깨뜨리지 않고 관찰하세요",
      "hero.lead":
        "window.postMessage · MessageChannel · BroadcastChannel · Worker/ServiceWorker의 메시지를 <strong>색상과 그룹</strong>으로 정리해 DevTools 콘솔에서 한눈에 확인할 수 있습니다.",
      "hero.badge1": "비침투적(Non‑intrusive)",
      "hero.badge2": "토글 가능",
      "hero.badge3": "읽기 전용",
      "hero.cta1": "빠르게 시작하기",
      "hero.cta2": "GitHub 보기",
      "features.title": "왜 MCT인가요?",
      "features.f1.title": "다양한 채널 관찰",
      "features.f1.desc":
        "window.postMessage, MessageChannel/MessagePort, BroadcastChannel, Worker/SharedWorker, ServiceWorker까지 한 번에.",
      "features.f2.title": "콘솔에 최적화",
      "features.f2.desc": "색상/그룹으로 스레드처럼 묶어서 흐름을 따라가기 쉽습니다.",
      "features.f3.title": "안전한 읽기 전용",
      "features.f3.desc": "원래 동작을 변경하지 않는 비침투적 래핑으로 신뢰성을 높였습니다.",
      "features.f4.title": "상태 전환",
      "features.f4.desc":
        "팝업에서 켜기/끄기 전환, 전역 상태는 <code>chrome.storage.sync</code>에 보존됩니다.",
      "install.title": "빠른 시작",
      "install.s1": "주소창에 <code>chrome://extensions</code> 입력",
      "install.s2": "<strong>Developer mode</strong> 활성화",
      "install.s3": "<strong>Load unpacked</strong> → 저장소의 <code>extension/</code> 선택",
      "install.s4": "확장 아이콘을 고정한 뒤, 켜기/끄기로 로깅을 제어합니다.",
      "install.note": "웹스토어 배포 전까지는 수동 로드로 사용하세요.",
      "usage.title": "사용법",
      "usage.desc": "아무 페이지의 DevTools 콘솔에서 실행해 보세요. 콘솔에 MCT 로그가 출력됩니다.",
      "usage.copy": "복사",
      "usage.note":
        "여러 채널을 한 번에 시험하려면 로컬 <strong>Playground</strong>를 사용하세요. <code>pnpm run docs</code>로 정적 서버를 실행한 뒤 <code>/playground/</code>에 접속하세요.",
      "how.title": "동작 원리",
      "how.l1":
        "<code>content.js</code>가 <code>tracker.js</code>를 삽입해 페이지 컨텍스트에서 안전하게 내장 객체를 래핑합니다.",
      "how.l2": "메시지는 색상/그룹으로 정리되어 콘솔에 출력되며,",
      "how.l3": "토글 이벤트(<code>MCT:SET_ENABLED</code>)로 로깅을 제어합니다.",
      "how.l4": "원래 동작을 바꾸지 않는 <em>읽기 전용</em> 설계입니다.",
      "how.perms": "필요 권한: <code>storage</code>, <code>tabs</code>",
      "how.note.title": "주의",
      "how.note.body":
        "대량 메시지 환경에서는 성능을 위해 필요할 때만 켜거나, 콘솔 필터링을 함께 사용하세요.",
      "faq.title": "FAQ",
      "faq.q1": "성능에 영향이 있나요?",
      "faq.a1":
        "일반적인 개발/디버깅 시나리오에서 영향을 최소화하도록 구현했습니다. 대량 메시지 환경에서는 로깅을 꺼 부하를 줄일 수 있습니다.",
      "faq.q2": "프로덕션 페이지에 사용해도 되나요?",
      "faq.a2": "개발/테스트 용도로 권장됩니다. 프로덕션 환경에서는 필요한 시점에만 켜 주세요.",
      "faq.q3": "무엇을 로깅하나요?",
      "faq.a3":
        "window.postMessage, MessageChannel/MessagePort, BroadcastChannel, Worker/SharedWorker, ServiceWorker의 postMessage/수신 메시지 이벤트를 다룹니다.",
      "header.h1": "Message Channel Tracker — Playground",
      "header.theme": "테마",
      "header.clear": "지우기",
      "header.desc":
        "아래 콘솔 영역에서 메시지를 바로 확인할 수 있습니다. 확장 팝업으로 로깅을 켜기/끄기 할 수 있습니다.",
      "btn.post_self": "자기 자신에게 전송",
      "btn.post_iframe": "iframe 으로 전송",
      "btn.post_xorigin": "크로스 오리진으로 전송",
      "note.post": "window.postMessage 를 사용하고 message 이벤트를 수신합니다.",
      "btn.mc_init": "채널 초기화",
      "btn.mc_ping": "포트 간 Ping",
      "note.mc": "채널을 만들고 포트를 전달하며 메시지를 왕복합니다.",
      "btn.bc_open": "채널 열기",
      "btn.bc_send": "브로드캐스트 보내기",
      "note.bc": "같은 이름의 두 채널을 열고 메시지를 교환합니다.",
      "btn.worker_start": "워커 시작",
      "btn.worker_ping": "워커 Ping",
      "note.worker": "전용 워커를 생성하고 메시지를 주고받습니다.",
      "btn.shared_start": "SharedWorker 시작",
      "btn.shared_ping": "SharedWorker Ping",
      "note.shared": "MessagePort 를 통해 SharedWorker 에 연결합니다.",
      "btn.sw_register": "SW 등록",
      "btn.sw_ping": "SW Ping",
      "note.sw": "서비스 워커를 등록하고 메시지를 교환합니다.",
      "console.title": "Console",
    },
  };

  function applyI18n(lang) {
    const dict = messages[lang] || messages.en;
    const nodes = document.querySelectorAll("[data-i18n]");
    try {
      document.documentElement.setAttribute("lang", lang === "ko" ? "ko" : "en");
    } catch {}
    for (const el of nodes) {
      const key = el.getAttribute("data-i18n");
      const val = dict[key];
      if (typeof val === "string") {
        el.innerHTML = val;
      }
    }
  }

  function init() {
    const select = document.getElementById("lang-select");
    const saved = localStorage.getItem("mct:lang");
    const initial = saved && (saved === "en" || saved === "ko") ? saved : "en";
    if (select) {
      select.value = initial;
      select.addEventListener("change", () => {
        const lang = select.value;
        localStorage.setItem("mct:lang", lang);
        applyI18n(lang);
      });
    }
    applyI18n(initial);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
