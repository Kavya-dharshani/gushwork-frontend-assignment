/**
 * Gushwork Assignment — Main JavaScript
 * Handles: image carousel, hover zoom, sticky header, mobile menu
 */

(function () {
  "use strict";

  /* --------------------------------------------------------------------------
     Carousel data
     -------------------------------------------------------------------------- */
  const IMAGES = [
    { src: "assets/images/hero_first_image.png", alt: "HDPE Pipes - View 1" },
    { src: "assets/images/hero_second_image.jpg", alt: "Pipeline Infrastructure - View 2" },
    { src: "assets/images/hero_third_image.jpg", alt: "Industrial Piping - View 3" },
    { src: "assets/images/hero_fourth_image.jpg", alt: "Pipeline System - View 4" },
    { src: "assets/images/hero_fifth_image.jpg", alt: "Modern Pipes - View 5" },
  ];

  let currentIndex = 0;

  /* DOM references */
  const mainImage = document.getElementById("mainImage");
  const thumbList = document.getElementById("thumbList");
  const imageCounter = document.getElementById("imageCounter");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const zoomPanel = document.getElementById("zoomPanel");
  const zoomLens = document.getElementById("zoomLens");
  const galleryMain = document.getElementById("galleryMain");
  const stickyBar = document.getElementById("stickyBar");
  const hero = document.getElementById("hero");
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const menuBackdrop = document.getElementById("menuBackdrop");

  const ZOOM_SCALE = 2;
  const DESKTOP_ZOOM_MIN = 1080;

  /* --------------------------------------------------------------------------
     Carousel
     -------------------------------------------------------------------------- */
  function renderThumbnails() {
    thumbList.innerHTML = "";
    IMAGES.forEach((img, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery__thumb" + (index === currentIndex ? " is-active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", index === currentIndex ? "true" : "false");
      btn.setAttribute("aria-label", `View ${img.alt}`);
      btn.innerHTML = `<img src="${img.src}" alt="" loading="lazy" />`;
      btn.addEventListener("click", () => goToSlide(index));
      thumbList.appendChild(btn);
    });
  }

  function updateSlide(index) {
    currentIndex = (index + IMAGES.length) % IMAGES.length;
    const current = IMAGES[currentIndex];

    mainImage.src = current.src;
    mainImage.alt = current.alt;
    imageCounter.textContent = `${currentIndex + 1} / ${IMAGES.length}`;

    // Refresh zoom panel background when visible
    if (zoomPanel.classList.contains("is-active")) {
      zoomPanel.style.backgroundImage = `url("${current.src}")`;
    }

    thumbList.querySelectorAll(".gallery__thumb").forEach((thumb, i) => {
      const active = i === currentIndex;
      thumb.classList.toggle("is-active", active);
      thumb.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function goToSlide(index) {
    updateSlide(index);
  }

  function nextSlide() {
    updateSlide(currentIndex + 1);
  }

  function prevSlide() {
    updateSlide(currentIndex - 1);
  }

  prevBtn.addEventListener("click", prevSlide);
  nextBtn.addEventListener("click", nextSlide);

  // Keyboard navigation on gallery
  galleryMain.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "ArrowRight") nextSlide();
  });

  /* --------------------------------------------------------------------------
     Image zoom on hover (desktop)
     -------------------------------------------------------------------------- */
  function isZoomEnabled() {
    return window.innerWidth >= DESKTOP_ZOOM_MIN && window.matchMedia("(hover: hover)").matches;
  }

  function showZoom() {
    if (!isZoomEnabled()) return;
    const src = IMAGES[currentIndex].src;
    zoomPanel.style.backgroundImage = `url("${src}")`;
    zoomPanel.classList.add("is-active");
    zoomPanel.setAttribute("aria-hidden", "false");
    zoomLens.classList.add("is-active");
    zoomLens.setAttribute("aria-hidden", "false");
  }

  function hideZoom() {
    zoomPanel.classList.remove("is-active");
    zoomPanel.setAttribute("aria-hidden", "true");
    zoomLens.classList.remove("is-active");
    zoomLens.setAttribute("aria-hidden", "true");
  }

  function handleZoomMove(event) {
    if (!isZoomEnabled() || !zoomPanel.classList.contains("is-active")) return;

    const rect = mainImage.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    zoomPanel.style.backgroundPosition = `${clampedX}% ${clampedY}%`;

    // Magnifier follows cursor
    const lensSize = zoomLens.offsetWidth || 100;
    zoomLens.style.top = `${event.clientY - lensSize / 2}px`;
    zoomLens.style.left = `${event.clientX - lensSize / 2}px`;
  }

  mainImage.addEventListener("mouseenter", showZoom);
  mainImage.addEventListener("mousemove", handleZoomMove);
  mainImage.addEventListener("mouseleave", hideZoom);

  window.addEventListener("resize", () => {
    if (!isZoomEnabled()) hideZoom();
  });

  /* --------------------------------------------------------------------------
     Sticky header: show when scrolling down past first fold, hide on scroll up
     Positions above the main navigation bar
     -------------------------------------------------------------------------- */
  let lastScrollY = window.scrollY;
  let ticking = false;

  function getFirstFoldHeight() {
    return hero ? hero.offsetHeight : window.innerHeight;
  }

  function updateStickyHeader() {
    const currentScrollY = window.scrollY;
    const foldHeight = getFirstFoldHeight();
    const scrollingDown = currentScrollY > lastScrollY;
    const pastFirstFold = currentScrollY > foldHeight;

    if (pastFirstFold && scrollingDown) {
      stickyBar.classList.add("is-visible");
      stickyBar.setAttribute("aria-hidden", "false");
      document.body.classList.add("sticky-bar-visible");
    } else {
      stickyBar.classList.remove("is-visible");
      stickyBar.setAttribute("aria-hidden", "true");
      document.body.classList.remove("sticky-bar-visible");
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateStickyHeader);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  /* --------------------------------------------------------------------------
     Mobile menu
     -------------------------------------------------------------------------- */
  function openMenu() {
    mobileMenu.hidden = false;
    menuBackdrop.hidden = false;
    mobileMenu.classList.add("is-open");
    menuBackdrop.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
    document.body.classList.add("menu-open");
  }

  function closeMenu() {
    mobileMenu.classList.remove("is-open");
    menuBackdrop.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("menu-open");

    setTimeout(() => {
      if (!mobileMenu.classList.contains("is-open")) {
        mobileMenu.hidden = true;
        menuBackdrop.hidden = true;
      }
    }, 300);
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) closeMenu();
    else openMenu();
  });

  menuBackdrop.addEventListener("click", closeMenu);

  document.querySelectorAll("[data-close-menu]").forEach((el) => {
    el.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* --------------------------------------------------------------------------
     Init
     -------------------------------------------------------------------------- */
  renderThumbnails();
  updateSlide(0);

  // Make gallery focusable for keyboard users
  galleryMain.setAttribute("tabindex", "0");
})();
