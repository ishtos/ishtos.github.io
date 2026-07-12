// ============================================================
//  Personal profile site — interactions
//  依存ライブラリなし。編集は基本的に不要です。
// ============================================================
(function () {
  "use strict";

  // JS が動いている印。これが付いた時だけ起動アニメの初期状態（非表示）を効かせる。
  // JS 無効/失敗時はクラスが付かないので要素は常時表示される（安全側）。
  document.documentElement.classList.add("js");

  // 万一エラーが出ても本文を隠したままにしない（FOUC ゲートの保険）
  setTimeout(function () {
    document.documentElement.classList.remove("i18n-loading");
  }, 1200);

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  var hasIO = "IntersectionObserver" in window;

  // --- テーマ切替（ダーク⇔ライト） ---------------------------
  // data-theme は <head> のインラインスクリプトで描画前に設定済み。
  (function () {
    var root = document.documentElement;
    var meta = document.querySelector('meta[name="theme-color"]');
    var COLORS = { dark: "#0d1117", light: "#ffffff" };
    var apply = function (theme) {
      root.setAttribute("data-theme", theme);
      if (meta) meta.setAttribute("content", COLORS[theme] || COLORS.dark);
    };
    apply(root.getAttribute("data-theme") === "light" ? "light" : "dark");
    var btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      btn.addEventListener("click", function () {
        var next =
          root.getAttribute("data-theme") === "light" ? "dark" : "light";
        apply(next);
        try {
          localStorage.setItem("theme", next);
        } catch (e) {}
      });
    }
  })();

  // --- スクロールで要素をフェードアップ表示 -----------------
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !hasIO) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // --- トップバー: スクロールで境界線を表示 -----------------
  var nav = document.querySelector("[data-nav]");
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // --- スクロール連動で現在地のナビをハイライト -------------
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll("[data-nav-link]")
  );
  if (hasIO && navLinks.length) {
    var linkById = {};
    navLinks.forEach(function (link) {
      linkById[link.getAttribute("href").slice(1)] = link;
    });
    var sections = navLinks
      .map(function (link) {
        return document.getElementById(link.getAttribute("href").slice(1));
      })
      .filter(Boolean);

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) {
              l.classList.remove("is-active");
            });
            var active = linkById[entry.target.id];
            if (active) active.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      spy.observe(s);
    });
  }

  // --- 日英切替 (i18n) -------------------------------------
  // 各要素の日本語は元の innerHTML を、英語は data-en を使う。
  // data-en 内の {br} は改行 <br> に変換される。
  var i18nEls = Array.prototype.slice.call(
    document.querySelectorAll("[data-en]")
  );
  if (i18nEls.length) {
    // 初期表示（日本語）の innerHTML を保持
    i18nEls.forEach(function (el) {
      el.__ja = el.innerHTML;
    });

    var applyLang = function (lang) {
      i18nEls.forEach(function (el) {
        if (lang === "en") {
          var parts = (el.getAttribute("data-en") || "").split("{br}");
          el.textContent = "";
          parts.forEach(function (part, i) {
            if (i) el.appendChild(document.createElement("br"));
            el.appendChild(document.createTextNode(part));
          });
        } else {
          el.innerHTML = el.__ja;
        }
      });
      document.documentElement.lang = lang;
      var buttons = document.querySelectorAll("[data-langsw] [data-lang]");
      buttons.forEach(function (b) {
        b.setAttribute(
          "aria-pressed",
          String(b.getAttribute("data-lang") === lang)
        );
      });
    };

    var stored = null;
    try {
      stored = localStorage.getItem("lang");
    } catch (e) {}
    // 保存された選択が無ければ英語をデフォルトにする
    var initial = stored === "en" || stored === "ja" ? stored : "en";
    applyLang(initial);
    // 言語を適用したら本文を表示（FOUC ゲート解除）
    document.documentElement.classList.remove("i18n-loading");

    var sw = document.querySelector("[data-langsw]");
    if (sw) {
      sw.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-lang]");
        if (!btn) return;
        var lang = btn.getAttribute("data-lang");
        applyLang(lang);
        try {
          localStorage.setItem("lang", lang);
        } catch (err) {}
      });
    }
  }

  // --- モバイルメニューの開閉 -------------------------------
  var toggle = document.querySelector("[data-nav-toggle]");
  var menu = document.querySelector("[data-nav-menu]");
  if (toggle && menu) {
    var setMenu = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute(
        "aria-label",
        open ? "メニューを閉じる" : "メニューを開く"
      );
      menu.hidden = !open;
    };
    toggle.addEventListener("click", function () {
      setMenu(menu.hidden);
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) {
        setMenu(false);
        toggle.focus();
      }
    });
    window
      .matchMedia("(min-width: 861px)")
      .addEventListener("change", function (e) {
        if (e.matches) setMenu(false);
      });
  }

  // --- ヒーロー起動シーケンス --------------------------------
  (function () {
    var hero = document.querySelector(".hero");
    if (!hero) return;
    if (reduceMotion) {
      hero.classList.add("is-booted");
      return;
    }
    // 初期状態（非表示）を一度描画してから is-booted を付け、段階表示を走らせる
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add("is-booted");
      });
    });
  })();

  // --- コマンドパレット (⌘K) --------------------------------
  (function () {
    var root = document.querySelector("[data-cmdk]");
    if (!root) return;
    var input = root.querySelector("[data-cmdk-input]");
    var list = root.querySelector("[data-cmdk-list]");
    var emptyMsg = root.querySelector("[data-cmdk-empty]");
    var lastFocus = null;
    var active = -1;

    var isEn = function () {
      return document.documentElement.lang === "en";
    };

    var goTo = function (id) {
      return function () {
        close();
        var t = document.getElementById(id);
        if (!t) return;
        t.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
        if (history.replaceState) history.replaceState(null, "", "#" + id);
        else location.hash = "#" + id;
      };
    };
    var openUrl = function (url) {
      return function () {
        window.open(url, "_blank", "noopener");
        close();
      };
    };

    var COMMANDS = [
      { icon: "▸", ja: "プロフィールへ", en: "Go to Profile", hint: "#about", run: goTo("about") },
      { icon: "▸", ja: "経歴へ", en: "Go to Career", hint: "#career", run: goTo("career") },
      { icon: "▸", ja: "スキルへ", en: "Go to Skills", hint: "#skills", run: goTo("skills") },
      { icon: "▸", ja: "実績へ", en: "Go to Work", hint: "#work", run: goTo("work") },
      { icon: "▸", ja: "連絡先へ", en: "Go to Contact", hint: "#contact", run: goTo("contact") },
      { icon: "◐", ja: "テーマを切替", en: "Toggle theme", hint: "theme", run: function () {
          var b = document.querySelector("[data-theme-toggle]");
          if (b) b.click();
        } },
      { icon: "⇄", ja: "言語を切替 (JA / EN)", en: "Toggle language (JA / EN)", hint: "lang", run: function () {
          var next = isEn() ? "ja" : "en";
          var b = document.querySelector('[data-langsw] [data-lang="' + next + '"]');
          if (b) b.click();
          render();
        } },
      { icon: "↗", ja: "GitHub を開く", en: "Open GitHub", hint: "github", run: openUrl("https://github.com/ishtos") },
      { icon: "↗", ja: "LinkedIn を開く", en: "Open LinkedIn", hint: "linkedin", run: openUrl("https://www.linkedin.com/in/toshiki-ishikawa-1864b8167/") },
    ];

    var entries = COMMANDS.map(function (cmd, i) {
      var li = document.createElement("li");
      li.className = "cmdk__item";
      li.setAttribute("role", "option");
      li.id = "cmdk-opt-" + i;
      var icon = document.createElement("span");
      icon.className = "cmdk__icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = cmd.icon;
      var label = document.createElement("span");
      label.className = "cmdk__label";
      var hint = document.createElement("span");
      hint.className = "cmdk__hint";
      hint.textContent = cmd.hint;
      li.appendChild(icon);
      li.appendChild(label);
      li.appendChild(hint);
      list.appendChild(li);
      var entry = { cmd: cmd, el: li, label: label };
      li.addEventListener("click", function () {
        cmd.run();
      });
      li.addEventListener("mousemove", function () {
        var idx = visible().indexOf(entry);
        if (idx !== -1) setActive(idx);
      });
      return entry;
    });

    var visible = function () {
      return entries.filter(function (e) {
        return !e.el.hidden;
      });
    };

    var setActive = function (i) {
      var vis = visible();
      active = i;
      entries.forEach(function (e) {
        e.el.classList.remove("is-active");
      });
      if (i >= 0 && vis[i]) {
        vis[i].el.classList.add("is-active");
        input.setAttribute("aria-activedescendant", vis[i].el.id);
        vis[i].el.scrollIntoView({ block: "nearest" });
      } else {
        input.removeAttribute("aria-activedescendant");
      }
    };

    var render = function () {
      var q = (input.value || "").trim().toLowerCase();
      entries.forEach(function (e) {
        e.label.textContent = isEn() ? e.cmd.en : e.cmd.ja;
        var hay = (e.cmd.en + " " + e.cmd.ja + " " + e.cmd.hint).toLowerCase();
        e.el.hidden = q.length > 0 && hay.indexOf(q) === -1;
      });
      var vis = visible();
      if (emptyMsg) emptyMsg.hidden = vis.length > 0;
      setActive(vis.length ? 0 : -1);
    };

    var open = function () {
      if (!root.hidden) return;
      lastFocus = document.activeElement;
      root.hidden = false;
      document.body.classList.add("is-cmdk-open");
      input.value = "";
      render();
      input.focus();
    };
    var close = function () {
      if (root.hidden) return;
      root.hidden = true;
      document.body.classList.remove("is-cmdk-open");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    var move = function (dir) {
      var vis = visible();
      if (!vis.length) return;
      setActive((active + dir + vis.length) % vis.length);
    };

    document.querySelectorAll("[data-cmdk-open]").forEach(function (b) {
      b.addEventListener("click", open);
    });
    root.querySelectorAll("[data-cmdk-close]").forEach(function (b) {
      b.addEventListener("click", close);
    });

    // グローバル: ⌘K / Ctrl+K で開閉
    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        if (root.hidden) open();
        else close();
      }
    });

    // 入力欄のキー操作（矢印で移動 / Enter で実行 / Esc で閉じる / Tab はトラップ）
    input.addEventListener("input", render);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        move(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        move(-1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        var vis = visible();
        if (active >= 0 && vis[active]) vis[active].cmd.run();
      } else if (e.key === "Tab") {
        e.preventDefault();
      }
    });
  })();
})();
