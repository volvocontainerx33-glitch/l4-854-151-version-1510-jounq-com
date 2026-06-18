(function () {
  var menuButton = document.querySelector(".mobile-menu-button");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-slide")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        restart();
      });
    }

    restart();
  }

  var filterScope = document.querySelector("[data-filter-scope]");
  if (filterScope) {
    var searchInput = filterScope.querySelector("#pageSearch");
    var typeFilter = filterScope.querySelector("#typeFilter");
    var yearFilter = filterScope.querySelector("#yearFilter");
    var cards = Array.prototype.slice.call(filterScope.querySelectorAll(".movie-card"));

    function applyFilters() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var type = typeFilter ? typeFilter.value : "";
      var year = yearFilter ? yearFilter.value : "";

      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchType = !type || card.getAttribute("data-type") === type;
        var matchYear = !year || card.getAttribute("data-year") === year;
        card.classList.toggle("hidden-card", !(matchKeyword && matchType && matchYear));
      });
    }

    [searchInput, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });
  }

  if (window.SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.getElementById("searchInput");
    var results = document.getElementById("searchResults");
    var summary = document.getElementById("searchSummary");

    if (input) {
      input.value = query;
    }

    if (results && summary) {
      var lower = query.toLowerCase();
      var items = window.SEARCH_INDEX.filter(function (item) {
        if (!lower) {
          return true;
        }
        return [item.title, item.line, item.genre, item.type, item.region, item.year, item.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .indexOf(lower) !== -1;
      }).slice(0, 80);

      summary.textContent = query ? "搜索结果：" + query : "推荐浏览";
      results.innerHTML = items.map(function (item) {
        return [
          "<article class=\"movie-card\">",
          "<a class=\"poster-link\" href=\"" + item.file + "\" aria-label=\"" + escapeHtml(item.title) + "\">",
          "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
          "<span class=\"type-pill\">" + escapeHtml(item.type) + "</span>",
          "<span class=\"poster-shade\"></span>",
          "<span class=\"poster-desc\">" + escapeHtml(item.line) + "</span>",
          "</a>",
          "<div class=\"card-body\">",
          "<h2><a href=\"" + item.file + "\">" + escapeHtml(item.title) + "</a></h2>",
          "<p class=\"card-meta\">" + escapeHtml(item.year + " · " + item.region + " · " + item.genre) + "</p>",
          "<p class=\"card-line\">" + escapeHtml(item.line) + "</p>",
          "<div class=\"tag-list\">" + item.tags.slice(0, 4).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
          }).join("") + "</div>",
          "</div>",
          "</article>"
        ].join("");
      }).join("");
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
