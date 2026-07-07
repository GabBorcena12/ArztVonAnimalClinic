(() => {
  "use strict";

  const visibleCount = () => window.matchMedia("(max-width: 600px)").matches ? 3 : 4;

  function updateExpandable(section) {
    const items = [...section.querySelectorAll("[data-expandable-item]")];
    const button = section.querySelector("[data-expand-toggle]");
    if (!button) return;
    const expanded = section.dataset.expanded === "true";
    const limit = visibleCount();
    items.forEach((item, index) => item.classList.toggle("expandable-item--hidden", !expanded && index >= limit));
    button.hidden = items.length <= limit;
    button.textContent = expanded ? "Show Less" : "Show More";
    button.setAttribute("aria-expanded", String(expanded));
  }

  const expandableSections = [...document.querySelectorAll("[data-expandable-section]")];
  expandableSections.forEach(section => {
    const button = section.querySelector("[data-expand-toggle]");
    button?.addEventListener("click", () => {
      const wasExpanded = section.dataset.expanded === "true";
      section.dataset.expanded = String(!wasExpanded);
      updateExpandable(section);
      if (wasExpanded) section.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    updateExpandable(section);
  });

  const galleryItems = [
    ["Grooming Visit", "Grooming"], ["Clinic Visit", "Clinic Visits"],
    ["Fresh Groom", "Grooming"], ["Happy Fur Patient", "Dogs"],
    ["Pet Care Moment", "Cats"], ["Clean and Comfortable", "Clinic Visits"],
    ["Happy Fur Patient", "Cats"], ["Pet Care Moment", "Dogs"]
  ];
  const gallery = document.querySelector("[data-gallery]");
  const galleryGrid = document.querySelector("#gallery-cards");
  const galleryToggle = document.querySelector("[data-gallery-toggle]");
  const modalBackdrop = document.querySelector(".gallery-modal-backdrop");
  const modal = modalBackdrop?.querySelector(".gallery-modal");

  function openGalleryModal(title, category) {
    if (!modalBackdrop || !modal) return;
    modal.querySelector("h2").textContent = title;
    modal.querySelector("strong").textContent = title;
    modal.querySelector("footer small").textContent = category;
    modalBackdrop.hidden = false;
    document.body.classList.add("modal-open");
    modal.querySelector("button").focus();
  }

  function closeGalleryModal() {
    if (!modalBackdrop) return;
    modalBackdrop.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function renderGallery() {
    if (!gallery || !galleryGrid || !galleryToggle) return;
    const filter = gallery.dataset.filter || "All";
    const expanded = gallery.dataset.expanded === "true";
    const filtered = galleryItems.filter(([, category]) => filter === "All" || category === filter);
    galleryGrid.replaceChildren(...filtered.map(([title, category], index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "gallery-card" + (!expanded && index >= visibleCount() ? " expandable-item--hidden" : "");
      card.innerHTML = `<span class="media-placeholder gallery-card__media"><span class="media-placeholder__icon">AV</span><strong>${title}</strong><small>Real clinic photo coming soon</small></span><span class="gallery-card__caption"><strong>${title}</strong><small>${category}</small></span>`;
      card.addEventListener("click", () => openGalleryModal(title, category));
      return card;
    }));
    galleryToggle.hidden = filtered.length <= visibleCount();
    galleryToggle.textContent = expanded ? "Show Less" : "Show More";
    galleryToggle.setAttribute("aria-expanded", String(expanded));
    window.lazyRevealAnimations?.initialize();
  }

  gallery?.querySelectorAll("[data-gallery-filter]").forEach(button => button.addEventListener("click", () => {
    gallery.querySelectorAll("[data-gallery-filter]").forEach(item => item.classList.toggle("is-active", item === button));
    gallery.dataset.filter = button.dataset.galleryFilter;
    gallery.dataset.expanded = "false";
    renderGallery();
  }));
  galleryToggle?.addEventListener("click", () => {
    const wasExpanded = gallery.dataset.expanded === "true";
    gallery.dataset.expanded = String(!wasExpanded);
    renderGallery();
    if (wasExpanded) gallery.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  modal?.querySelector("header button")?.addEventListener("click", closeGalleryModal);
  modalBackdrop?.addEventListener("click", closeGalleryModal);
  modal?.addEventListener("click", event => event.stopPropagation());
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !modalBackdrop?.hidden) closeGalleryModal(); });
  renderGallery();

  const form = document.querySelector("#appointment-form");
  const status = document.querySelector("#form-status");
  form?.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const submit = form.querySelector("button[type=submit]");
    if (submit.disabled) return;
    submit.disabled = true;
    submit.textContent = "Sending...";
    status.textContent = "";
    status.className = "form-status full";
    try {
      const response = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Unable to send appointment request.");
      form.reset();
      status.textContent = "Your appointment request was sent. The clinic will contact you to confirm.";
      status.classList.add("form-status--success");
    } catch (error) {
      status.textContent = "We could not send your request. Please try again or contact the clinic directly.";
      status.classList.add("form-status--error");
    } finally {
      submit.disabled = false;
      submit.textContent = "Submit Appointment Request";
    }
  });

  const header = document.querySelector(".site-header");
  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (!(matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    const targets = document.querySelectorAll(".hero__content, main > section > .container, .cta-band__inner, .site-footer .container");
    targets.forEach(target => target.classList.add("reveal-section"));
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    targets.forEach(target => observer.observe(target));
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { expandableSections.forEach(updateExpandable); renderGallery(); }, 180);
  });
})();
