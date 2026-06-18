(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMobileNav() {
    var toggle = qs(".nav-toggle");
    var menu = qs("#mobileNav");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slider = qs("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = qsa(".hero-slide", slider);
    var dots = qsa(".hero-dot", slider);
    var current = 0;
    var timer = null;
    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === current);
      });
    }
    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }
    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(idx);
        play();
      });
    });
    show(0);
    play();
  }

  function getSearchParams() {
    try {
      return new URLSearchParams(window.location.search);
    } catch (error) {
      return new URLSearchParams("");
    }
  }

  function initSearchPage() {
    var grid = qs("[data-search-grid]");
    var form = qs("[data-search-form]");
    if (!grid || !form) {
      return;
    }
    var input = qs("#searchInput");
    var typeFilter = qs("#typeFilter");
    var yearFilter = qs("#yearFilter");
    var genreFilter = qs("#genreFilter");
    var cards = qsa(".search-card", grid);
    var params = getSearchParams();
    var initial = params.get("q") || "";
    if (initial && input) {
      input.value = initial;
    }
    function includesText(value, needle) {
      return String(value || "").toLowerCase().indexOf(needle) !== -1;
    }
    function apply() {
      var keyword = String(input && input.value || "").trim().toLowerCase();
      var type = String(typeFilter && typeFilter.value || "");
      var year = String(yearFilter && yearFilter.value || "");
      var genre = String(genreFilter && genreFilter.value || "");
      cards.forEach(function (card) {
        var terms = String(card.getAttribute("data-terms") || "").toLowerCase();
        var cardType = String(card.getAttribute("data-type") || "");
        var cardYear = String(card.getAttribute("data-year") || "");
        var cardGenre = String(card.getAttribute("data-genre") || "");
        var ok = true;
        if (keyword) {
          ok = ok && includesText(terms, keyword);
        }
        if (type) {
          ok = ok && cardType === type;
        }
        if (year) {
          ok = ok && cardYear === year;
        }
        if (genre) {
          ok = ok && cardGenre.indexOf(genre) !== -1;
        }
        card.classList.toggle("is-hidden", !ok);
      });
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      apply();
    });
    [input, typeFilter, yearFilter, genreFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function initLocalFilters() {
    qsa("[data-local-filter]").forEach(function (form) {
      var input = qs("input", form);
      var grid = qs("[data-filter-grid]");
      if (!input || !grid) {
        return;
      }
      var cards = qsa(".search-card", grid);
      function apply() {
        var keyword = String(input.value || "").trim().toLowerCase();
        cards.forEach(function (card) {
          var terms = String(card.getAttribute("data-terms") || "").toLowerCase();
          card.classList.toggle("is-hidden", keyword && terms.indexOf(keyword) === -1);
        });
      }
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      input.addEventListener("input", apply);
    });
  }

  function setupHlsPlayer(videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !streamUrl) {
      return;
    }
    var shell = button.parentElement;
    var attached = false;
    var hls = null;
    function attach() {
      if (attached) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      attached = true;
    }
    function start() {
      attach();
      button.classList.add("is-hidden");
      if (shell) {
        shell.classList.add("is-playing");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          button.classList.remove("is-hidden");
          if (shell) {
            shell.classList.remove("is-playing");
          }
        });
      }
    }
    button.addEventListener("click", function (event) {
      event.preventDefault();
      start();
    });
    if (shell) {
      shell.addEventListener("click", function (event) {
        if (!shell.classList.contains("is-playing") && event.target !== video) {
          start();
        }
      });
    }
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.setupHlsPlayer = setupHlsPlayer;

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initHero();
    initSearchPage();
    initLocalFilters();
  });
})();
