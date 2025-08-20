(() => {
  const messages = {
    en: {
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
    const initial =
      saved && (saved === "en" || saved === "ko")
        ? saved
        : (navigator.language || "en").startsWith("ko")
          ? "ko"
          : "en";
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
