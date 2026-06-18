(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 0) {
    var index = 0;
    var show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  var panelFilter = document.querySelector('[data-filter-panel]');
  if (panelFilter) {
    var keywordInput = panelFilter.querySelector('[data-filter-input]');
    var typeSelect = panelFilter.querySelector('[data-filter-type]');
    var regionSelect = panelFilter.querySelector('[data-filter-region]');
    var yearSelect = panelFilter.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (keywordInput && initialQuery) {
      keywordInput.value = initialQuery;
    }
    var runFilter = function () {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var passKeyword = !keyword || text.indexOf(keyword) !== -1;
        var passType = !type || card.getAttribute('data-type') === type;
        var passRegion = !region || card.getAttribute('data-region') === region;
        var passYear = !year || card.getAttribute('data-year') === year;
        card.classList.toggle('hidden-by-filter', !(passKeyword && passType && passRegion && passYear));
      });
    };
    [keywordInput, typeSelect, regionSelect, yearSelect].forEach(function (item) {
      if (item) {
        item.addEventListener('input', runFilter);
        item.addEventListener('change', runFilter);
      }
    });
    runFilter();
  }
})();
