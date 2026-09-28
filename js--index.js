// ===== shared settings =====
const SCROLL_DURATION = 1200; // one speed for every smooth-scroll (links + back-to-top)
const MOBILE_NAV_BREAKPOINT = 992; // must match the CSS media query

// smooth scroll: accepts a CSS selector ("#tcg") OR a number (Y position)
function smoothScrollTo(target, duration = SCROLL_DURATION) {
  let targetY;
  if (typeof target === "number") {
    targetY = target;
  } else {
    const el = document.querySelector(target);
    if (!el) return;
    targetY = el.getBoundingClientRect().top + window.scrollY;
  }

  const startY = window.scrollY;
  const distance = targetY - startY;
  let startTime = null;

  function easeOutQuad(t) {
    return t * (2 - t);
  }

  function animateScroll(currentTime) {
    if (startTime === null) startTime = currentTime;

    const progress = Math.min((currentTime - startTime) / duration, 1);

    window.scrollTo(0, startY + distance * easeOutQuad(progress));

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  }

  requestAnimationFrame(animateScroll);
}

document.addEventListener("DOMContentLoaded", () => {
  const smoothLinks = document.querySelectorAll(".smooth-scroll");

  smoothLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      smoothScrollTo(link.getAttribute("data-target"), SCROLL_DURATION);
    });
  });
});

//
//
//
// back to top button
document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById("backToTop");
  if (!backBtn) return;

  function toggleBackBtn() {
    backBtn.classList.toggle("show", window.scrollY > 400);
  }

  window.addEventListener("scroll", toggleBackBtn, { passive: true });
  toggleBackBtn();

  backBtn.addEventListener("click", () => {
    smoothScrollTo(0, SCROLL_DURATION);
  });
});

//
//
//
// featured menu--slide
document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById("featuredTrack");
  const dotsContainer = document.getElementById("featuredDots");
  const prevBtn = document.querySelector(".featured-prev");
  const nextBtn = document.querySelector(".featured-next");
  const viewport = document.querySelector(".featured-viewport");

  if (!track) return;

  const originalCards = Array.from(track.children);
  const totalItems = originalCards.length;

  const AUTO_INTERVAL = 3500;
  const TRANSITION_MS = 600;

  let currentIndex = 0;

  let autoTimer = null;

  const clonesEnd = originalCards
    .slice(0, 3)
    .map((card) => card.cloneNode(true));
  const clonesStart = originalCards
    .slice(-3)
    .map((card) => card.cloneNode(true));

  track.prepend(...clonesStart);
  clonesEnd.forEach((clone) => track.appendChild(clone));

  const OFFSET = clonesStart.length;
  currentIndex = OFFSET;

  function goTo(index, animate = true) {
    track.style.transition = animate
      ? `transform ${TRANSITION_MS}ms ease`
      : "none";
    const targetCard = track.children[index];
    const cardCenter = targetCard.offsetLeft + targetCard.offsetWidth / 2;
    const viewportCenter = viewport.clientWidth / 2;
    track.style.transform = `translateX(${viewportCenter - cardCenter}px)`;
    currentIndex = index;
    updateDots();
  }

  function nextSlide() {
    goTo(currentIndex + 1);
  }

  function prevSlide() {
    goTo(currentIndex - 1);
  }

  track.addEventListener("transitionend", () => {
    if (currentIndex >= totalItems + OFFSET) {
      goTo(currentIndex - totalItems, false);
    } else if (currentIndex < OFFSET) {
      goTo(currentIndex + totalItems, false);
    }
  });

  function buildDots() {
    dotsContainer.innerHTML = "";
    originalCards.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "featured-dot";
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => {
        resetAutoSlide();
        goTo(i + OFFSET);
      });
      dotsContainer.appendChild(dot);
    });
  }

  function updateDots() {
    const realIndex =
      (((currentIndex - OFFSET) % totalItems) + totalItems) % totalItems;
    Array.from(dotsContainer.children).forEach((dot, i) => {
      dot.classList.toggle("active", i === realIndex);
    });
  }

  function startAutoSlide() {
    clearInterval(autoTimer);
    autoTimer = setInterval(nextSlide, AUTO_INTERVAL);
  }

  function resetAutoSlide() {
    clearInterval(autoTimer);
    startAutoSlide();
  }

  prevBtn.addEventListener("click", () => {
    resetAutoSlide();
    prevSlide();
  });

  nextBtn.addEventListener("click", () => {
    resetAutoSlide();
    nextSlide();
  });

  viewport.addEventListener("mouseenter", () => clearInterval(autoTimer));
  viewport.addEventListener("mouseleave", startAutoSlide);

  // touch support (swipe on mobile)
  let touchStartX = 0;
  viewport.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
      clearInterval(autoTimer);
    },
    { passive: true },
  );
  viewport.addEventListener("touchend", (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 40) {
      diff < 0 ? nextSlide() : prevSlide();
    }
    startAutoSlide();
  });

  window.addEventListener("resize", () => {
    goTo(currentIndex, false);
  });

  buildDots();
  goTo(currentIndex, false);
  startAutoSlide();
});

//
//
//
// slider for comments::
document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".testimonial-track");
  const viewport = document.querySelector(".viewport");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");

  if (!track) return;

  let offset = 0;

  function getStep() {
    const card = track.querySelector(".testimonials");
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function getMaxOffset() {
    return Math.max(0, track.scrollWidth - viewport.clientWidth);
  }

  function updateSlide() {
    offset = Math.min(Math.max(offset, 0), getMaxOffset());
    track.style.transform = `translateX(-${offset}px)`;
  }

  nextBtn.addEventListener("click", () => {
    offset += getStep();
    updateSlide();
  });

  prevBtn.addEventListener("click", () => {
    offset -= getStep();
    updateSlide();
  });

  window.addEventListener("resize", updateSlide);
});

//
//
//
// notification::
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("notifOverlay");
  const closeBtn = document.getElementById("notifClose");

  if (!overlay) return;

  setTimeout(() => {
    overlay.classList.add("active");
  }, 800);

  closeBtn.addEventListener("click", () => {
    overlay.classList.remove("active");
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("active");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      overlay.classList.remove("active");
    }
  });
});

//
//
//
// Mobile navigation (hamburger)
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");

  if (!menuToggle || !navMenu) return;

  function setMenu(open) {
    navMenu.classList.toggle("active", open);
    menuToggle.classList.toggle("active", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  }

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    setMenu(!navMenu.classList.contains("active"));
  });

  // close after tapping a link
  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  // close when tapping outside the menu
  document.addEventListener("click", (e) => {
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      setMenu(false);
    }
  });

  // close with Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  // reset when going back to desktop size
  window.addEventListener("resize", () => {
    if (window.innerWidth > MOBILE_NAV_BREAKPOINT) setMenu(false);
  });
});
