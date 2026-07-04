window.arztVonSite = (() => {
    let componentReference;
    let resizeTimer;
    let listening = false;
    let revealObserver;

    const updateNavbarShadow = () => {
        document.querySelector(".site-header")?.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    const initializeReveals = () => {
        const targets = document.querySelectorAll(".hero__content, main > section > .container, .cta-band__inner, .site-footer .container");
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
            targets.forEach(target => target.classList.add("is-visible"));
            return;
        }
        revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.08, rootMargin: "0px 0px -45px" });
        targets.forEach(target => {
            target.classList.add("reveal-section");
            revealObserver.observe(target);
        });
    };

    const updateVisibleCounts = () => {
        if (!componentReference) return;
        const mobile = window.matchMedia("(max-width: 600px)").matches;
        const tablet = window.matchMedia("(max-width: 860px)").matches;
        const visibleCount = mobile ? 3 : 4;
        componentReference.invokeMethodAsync("UpdateVisibleCounts", visibleCount, visibleCount);
    };

    const onResize = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(updateVisibleCounts, 180);
    };

    const initializeAppointmentForm = () => {
        const form = document.getElementById("appointment-form");
        if (!form || form.dataset.initialized === "true") return;
        form.dataset.initialized = "true";
        const status = document.getElementById("form-status");
        const button = form.querySelector('button[type="submit"]');
        const originalLabel = button.textContent;

        form.addEventListener("submit", async event => {
            event.preventDefault();
            status.className = "form-status full";
            status.textContent = "";
            if (!form.reportValidity()) return;
            const data = new FormData(form);
            if (String(data.get("honeypot") || "").trim()) return;
            button.disabled = true;
            button.textContent = "Sending...";
            try {
                const response = await fetch(form.action, { method: "POST", body: data, headers: { Accept: "application/json" } });
                const result = await response.json().catch(() => ({}));
                if (!response.ok || result.success === false) throw new Error("Submission failed");
                status.className = "form-status full success";
                status.textContent = "Request sent. Thank you—the clinic will contact you to confirm the schedule and service availability.";
                form.reset();
            } catch {
                status.className = "form-status full error";
                status.textContent = "Your request could not be sent. Please try again or message the clinic on Facebook.";
            } finally {
                button.disabled = false;
                button.textContent = originalLabel;
            }
        });
    };

    return {
        initialize(reference) {
            componentReference = reference;
            updateVisibleCounts();
            initializeAppointmentForm();
            initializeReveals();
            updateNavbarShadow();
            if (!listening) {
                window.addEventListener("resize", onResize);
                window.addEventListener("scroll", updateNavbarShadow, { passive: true });
                listening = true;
            }
        },
        scrollToSection(id) {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        },
        dispose() {
            componentReference = undefined;
            window.clearTimeout(resizeTimer);
            revealObserver?.disconnect();
            if (listening) {
                window.removeEventListener("resize", onResize);
                window.removeEventListener("scroll", updateNavbarShadow);
                listening = false;
            }
        }
    };
})();
