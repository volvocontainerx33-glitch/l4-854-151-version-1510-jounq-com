(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = carousel.querySelector("[data-hero-dots]");
        if (!slides.length || !dots) {
            return;
        }
        var current = 0;
        var buttons = slides.map(function (_, index) {
            var button = document.createElement("button");
            button.type = "button";
            button.setAttribute("aria-label", "切换到第 " + (index + 1) + " 个推荐");
            button.addEventListener("click", function () {
                show(index);
            });
            dots.appendChild(button);
            return button;
        });
        function show(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            buttons.forEach(function (button, buttonIndex) {
                button.classList.toggle("is-active", buttonIndex === current);
            });
        }
        show(0);
        window.setInterval(function () {
            show((current + 1) % slides.length);
        }, 5200);
    }

    function normalizeText(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initCardTools() {
        var list = document.querySelector("[data-card-list]");
        if (!list) {
            return;
        }
        var filter = document.querySelector("[data-card-filter]");
        var sort = document.querySelector("[data-sort-cards]");
        var cards = Array.prototype.slice.call(list.children);
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (filter && query) {
            filter.value = query;
        }
        function filterCards() {
            var keyword = normalizeText(filter ? filter.value : "");
            cards.forEach(function (card) {
                var haystack = normalizeText([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.type,
                    card.textContent
                ].join(" "));
                card.style.display = !keyword || haystack.indexOf(keyword) !== -1 ? "" : "none";
            });
        }
        function sortCards() {
            var value = sort ? sort.value : "default";
            var sorted = cards.slice();
            if (value === "year-desc") {
                sorted.sort(function (a, b) {
                    return Number(b.dataset.year.match(/\d{4}/) || 0) - Number(a.dataset.year.match(/\d{4}/) || 0);
                });
            }
            if (value === "year-asc") {
                sorted.sort(function (a, b) {
                    return Number(a.dataset.year.match(/\d{4}/) || 0) - Number(b.dataset.year.match(/\d{4}/) || 0);
                });
            }
            if (value === "title") {
                sorted.sort(function (a, b) {
                    return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-CN");
                });
            }
            sorted.forEach(function (card) {
                list.appendChild(card);
            });
        }
        if (filter) {
            filter.addEventListener("input", filterCards);
            filterCards();
        }
        if (sort) {
            sort.addEventListener("change", sortCards);
        }
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector(".player-cover");
            var stream = player.getAttribute("data-stream");
            var hlsInstance = null;
            var started = false;
            if (!video || !cover || !stream) {
                return;
            }
            function attachStream() {
                if (started) {
                    return;
                }
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }
            function play() {
                attachStream();
                cover.classList.add("is-hidden");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        cover.classList.remove("is-hidden");
                    });
                }
            }
            cover.addEventListener("click", play);
            video.addEventListener("play", function () {
                cover.classList.add("is-hidden");
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHeroCarousel();
        initCardTools();
        initPlayers();
    });
})();
