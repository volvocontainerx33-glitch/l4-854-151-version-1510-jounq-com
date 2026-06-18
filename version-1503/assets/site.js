(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function getQueryValue(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = "./search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      toggle.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function move(delta) {
      show(index + delta);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        move(1);
      }, 6500);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        move(1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupCardFilter() {
    document.querySelectorAll("[data-card-filter]").forEach(function (input) {
      var target = input.getAttribute("data-card-filter");
      var scope = target ? document.querySelector(target) : document;
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter]"));
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var hay = (card.getAttribute("data-filter") || "").toLowerCase();
          card.style.display = !query || hay.indexOf(query) !== -1 ? "" : "none";
        });
      });
    });
  }

  function createResultCard(movie) {
    return [
      "<a class=\"movie-card\" href=\"" + escapeHtml(movie.url) + "\" data-filter=\"" + escapeHtml(movie.filter) + "\">",
      "<span class=\"card-cover\">",
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" onerror=\"this.style.display='none'\">",
      "<span class=\"card-shade\"></span>",
      "<span class=\"card-hover-text\">" + escapeHtml(movie.oneLine) + "</span>",
      "<span class=\"type-pill\">" + escapeHtml(movie.type) + "</span>",
      "</span>",
      "<span class=\"card-body\">",
      "<strong class=\"card-title\">" + escapeHtml(movie.title) + "</strong>",
      "<span class=\"card-meta\"><span class=\"category-pill\">" + escapeHtml(movie.category) + "</span><span>" + escapeHtml(movie.year) + "</span></span>",
      "</span>",
      "</a>"
    ].join("");
  }

  function setupSearchPage() {
    var results = document.getElementById("searchResults");
    var form = document.getElementById("pageSearchForm");
    if (!results || !form || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var input = form.querySelector("input[name='q']");
    var category = form.querySelector("select[name='category']");
    var year = form.querySelector("select[name='year']");
    var query = getQueryValue("q");
    if (input && query) {
      input.value = query;
    }

    function render() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var cat = category ? category.value : "";
      var yr = year ? year.value : "";
      var list = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        var matchQuery = !q || movie.filter.toLowerCase().indexOf(q) !== -1;
        var matchCategory = !cat || movie.categorySlug === cat;
        var matchYear = !yr || String(movie.year) === yr;
        return matchQuery && matchCategory && matchYear;
      }).slice(0, 96);
      if (!list.length) {
        results.innerHTML = "<div class=\"empty-state\">没有找到匹配的影片</div>";
        return;
      }
      results.innerHTML = list.map(createResultCard).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });
    [input, category, year].forEach(function (field) {
      if (field) {
        field.addEventListener("input", render);
        field.addEventListener("change", render);
      }
    });
    render();
  }

  window.initMoviePlayer = function (id, src) {
    var video = document.getElementById(id);
    if (!video || !src) {
      return;
    }
    var panel = video.closest(".video-panel");
    var overlay = panel ? panel.querySelector(".player-overlay") : null;
    var started = false;

    function bindSource() {
      if (started) {
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = src;
      }
    }

    function play() {
      bindSource();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var attempt = function () {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      };
      if (video.readyState >= 1 || video.src) {
        attempt();
      } else {
        video.addEventListener("loadedmetadata", attempt, { once: true });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  };

  ready(function () {
    setupSearchForms();
    setupMobileMenu();
    setupHero();
    setupCardFilter();
    setupSearchPage();
  });
})();
