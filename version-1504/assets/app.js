(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var nextButton = carousel.querySelector("[data-hero-next]");
        var prevButton = carousel.querySelector("[data-hero-prev]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (nextButton) {
            nextButton.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        if (prevButton) {
            prevButton.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function initLists() {
        var lists = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));
        lists.forEach(function (list) {
            var section = list.closest("section") || document;
            var input = section.querySelector("[data-filter-input]") || document.querySelector("[data-page-search]");
            var sort = section.querySelector("[data-sort-select]");
            var empty = section.querySelector("[data-empty-state]");
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
            var original = cards.slice();

            function textFor(card) {
                return normalize([
                    card.dataset.title,
                    card.dataset.tags,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.region
                ].join(" "));
            }

            function apply() {
                var query = normalize(input ? input.value : "");
                var visibleCount = 0;
                cards.forEach(function (card) {
                    var visible = !query || textFor(card).indexOf(query) !== -1;
                    card.style.display = visible ? "" : "none";
                    if (visible) {
                        visibleCount += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visibleCount === 0);
                }
            }

            function sortCards() {
                var value = sort ? sort.value : "default";
                var sorted = original.slice();
                if (value === "year-desc") {
                    sorted.sort(function (a, b) {
                        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                    });
                }
                if (value === "year-asc") {
                    sorted.sort(function (a, b) {
                        return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
                    });
                }
                if (value === "title") {
                    sorted.sort(function (a, b) {
                        return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
                    });
                }
                sorted.forEach(function (card) {
                    list.appendChild(card);
                });
                cards = sorted;
                apply();
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (sort) {
                sort.addEventListener("change", sortCards);
            }
            sortCards();
        });
    }

    function initSearchQuery() {
        var input = document.querySelector("[data-page-search]");
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (query) {
            input.value = query;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    function initForms() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = "./search.html";
                }
            });
        });
    }

    function initMoviePlayer(videoId, streamUrl, coverId) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        if (!video || !streamUrl) {
            return;
        }
        var attached = false;
        var hlsInstance = null;

        function attachStream() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = streamUrl;
        }

        function play() {
            attachStream();
            video.controls = true;
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (!attached || video.paused) {
                play();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;

    ready(function () {
        initMenu();
        initHero();
        initForms();
        initLists();
        initSearchQuery();
    });
})();
