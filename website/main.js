/* ZenUML marketing site — behavior.
   All motion is gated behind prefers-reduced-motion. No external deps. */
(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Mobile nav toggle ------------------------------------------------ */
  var toggle = document.querySelector(".nav__toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // close menu after choosing a link (mobile)
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- Example switcher (accessible tabs) ------------------------------- */
  var tablist = document.querySelector('[role="tablist"]');
  if (tablist) {
    var tabs = Array.prototype.slice.call(
      tablist.querySelectorAll('[role="tab"]')
    );

    function selectTab(tab) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute("aria-selected", selected ? "true" : "false");
        t.tabIndex = selected ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !selected;
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        selectTab(tab);
      });
      tab.addEventListener("keydown", function (e) {
        var idx = null;
        if (e.key === "ArrowRight") idx = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft") idx = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") idx = 0;
        else if (e.key === "End") idx = tabs.length - 1;
        if (idx !== null) {
          e.preventDefault();
          selectTab(tabs[idx]);
          tabs[idx].focus();
        }
      });
    });
  }

  /* ---- Copy-to-clipboard for install command ---------------------------- */
  var copyBtn = document.getElementById("copy-btn");
  var cmd = document.getElementById("install-cmd");
  if (copyBtn && cmd) {
    copyBtn.addEventListener("click", function () {
      var text = cmd.textContent.trim();
      var done = function () {
        var prev = copyBtn.textContent;
        copyBtn.textContent = "Copied!";
        setTimeout(function () {
          copyBtn.textContent = prev;
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
      function fallback() {
        var r = document.createRange();
        r.selectNode(cmd);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
        try {
          document.execCommand("copy");
          done();
        } catch (err) {
          /* no-op */
        }
        sel.removeAllRanges();
      }
    });
  }

  /* ---- Motion: arrow-draw on load + scroll reveal ----------------------- */
  if (reduceMotion) return; // honor the user's preference — no animation.

  // trigger the hero arrow-draw once the hero SVG is on screen
  var hero = document.querySelector(".hero__signature");
  if (hero) {
    // add class next frame so the animation runs from its initial state
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add("animate-in");
      });
    });
  }

  // scroll reveal — progressive enhancement. Content is visible by default
  // (see styles.css); we only hide + animate when we can GUARANTEE a reveal.
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-reveal");

    var revealAll = function () {
      for (var i = 0; i < revealEls.length; i++) revealEls[i].classList.add("is-in");
    };

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      // trigger a touch before the element scrolls in; threshold 0 = any pixel.
      { rootMargin: "0px 0px 12% 0px", threshold: 0 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });

    // Failsafe: never leave a section blank. If the observer misses an element
    // (fast scroll, background tab, sampling gaps) reveal everything after a
    // short delay, and again on full load. In-view cards still animate first.
    window.setTimeout(revealAll, 1400);
    window.addEventListener("load", function () {
      window.setTimeout(revealAll, 400);
    });
  }
})();
