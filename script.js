const pathname = window.location.pathname;
const isHomePage = pathname === "/" || pathname.endsWith("/index.html");
if (!isHomePage) {
  const notFound = document.querySelector("#not-found");
  document.body.classList.add("is-404");
  document.body.replaceChildren(notFound.content.cloneNode(true));
  document.title = "404 — Page not found";
}

const navLinks = [...document.querySelectorAll(".site-nav a")];
const panels = [...document.querySelectorAll(".story-panel")];
const stage = document.querySelector(".story-stage");
const story = document.querySelector(".story-scroll");

if (stage && story && panels.length) {
  story.classList.add("is-enhanced");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let weights = panels.map((_, index) => index === 0 ? 1 : 0);
  let animation = 0;
  let scrollFrame = 0;

  function render(nextWeights) {
    weights = nextWeights;
    const activeIndex = weights.indexOf(Math.max(...weights));
    panels.forEach((panel, index) => {
      panel.style.opacity = String(weights[index]);
      // Keep a solid outgoing frame underneath the dissolving incoming frame.
      panel.style.zIndex = index === activeIndex ? "0" : "1";
      panel.classList.toggle("is-active", index === activeIndex);
      panel.inert = index !== activeIndex;
      panel.setAttribute("aria-hidden", String(index !== activeIndex));
    });
    panels[activeIndex].style.opacity = "1";
    navLinks.forEach((link) => {
      if (link.hash === `#${panels[activeIndex].id}`) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function renderScroll() {
    scrollFrame = 0;
    if (animation) return;
    const step = stage.getBoundingClientRect().height;
    const position = Math.max(0, Math.min(panels.length - 1,
      (window.scrollY - story.offsetTop) / step));
    if (reducedMotion.matches) {
      render(panels.map((_, index) => index === Math.round(position) ? 1 : 0));
    } else {
      render(panels.map((_, index) => Math.max(0, 1 - Math.abs(position - index))));
    }
  }

  function goTo(index, animate = true, focus = false) {
    cancelAnimationFrame(animation);
    animation = 0;
    const from = [...weights];
    const target = panels.map((_, panelIndex) => panelIndex === index ? 1 : 0);
    function focusHeading() {
      if (!focus) return;
      const heading = panels[index].querySelector("h1, h2");
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    if (animate && !reducedMotion.matches) {
      const start = performance.now();
      function dissolve(now) {
        const progress = Math.min(1, (now - start) / 850);
        const eased = progress * progress * (3 - 2 * progress);
        render(from.map((weight, panelIndex) =>
          weight + (target[panelIndex] - weight) * eased));
        animation = progress < 1 ? requestAnimationFrame(dissolve) : 0;
        if (progress === 1) focusHeading();
      }
      animation = requestAnimationFrame(dissolve);
    } else {
      render(target);
      focusHeading();
    }
    window.scrollTo({
      top: story.offsetTop + index * stage.getBoundingClientRect().height,
      behavior: "instant",
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const index = panels.findIndex((panel) => link.hash === `#${panel.id}`);
    if (index < 0) return;
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      history.pushState(null, "", link.hash);
      goTo(index, true, true);
    });
  });

  window.addEventListener("scroll", () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(renderScroll);
  }, { passive: true });

  function interruptTransition() {
    if (!animation) return;
    cancelAnimationFrame(animation);
    animation = 0;
    renderScroll();
  }
  window.addEventListener("wheel", interruptTransition, { passive: true });
  window.addEventListener("touchstart", interruptTransition, { passive: true });
  window.addEventListener("keydown", (event) => {
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
      interruptTransition();
    }
  });

  function restoreHash() {
    const index = panels.findIndex((panel) => window.location.hash === `#${panel.id}`);
    goTo(index < 0 ? 0 : index, false);
  }

  window.addEventListener("hashchange", restoreHash);
  function resizeStage() {
    story.style.setProperty("--stage-height", `${stage.getBoundingClientRect().height}px`);
    renderScroll();
  }
  if ("ResizeObserver" in window) {
    new ResizeObserver(resizeStage).observe(stage);
  } else {
    window.addEventListener("resize", resizeStage);
  }
  resizeStage();
  if (window.location.hash) restoreHash();
}
