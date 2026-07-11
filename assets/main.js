// ============================================================
//  Personal profile site — interactions
//  依存ライブラリなし。編集は基本的に不要です。
// ============================================================
(function () {
  "use strict";

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
    var COLORS = { dark: "#131110", light: "#f4f1ea" };
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
})();
