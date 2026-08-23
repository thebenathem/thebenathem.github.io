const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".main-nav");

if (menuButton && nav) {
    const closeMenu = () => {
        nav.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
    };

    closeMenu();

    menuButton.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
            menuButton.focus();
        }
    });

    const desktopView = window.matchMedia("(min-width: 851px)");
    desktopView.addEventListener("change", closeMenu);
}

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

if (contactForm && formStatus) {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const formData = new FormData(contactForm);

        submitButton.disabled = true;
        submitButton.textContent = "SENDING...";
        formStatus.textContent = "";

        try {
            const response = await fetch(contactForm.action, {
                method: "POST",
                body: formData,
                headers: {
                    Accept: "application/json"
                }
            });

            if (response.ok) {
                contactForm.reset();
                formStatus.textContent = "Message received. Thank you for getting in touch.";
            } else {
                formStatus.textContent = "Something went wrong. Please try again.";
            }
        } catch (error) {
            formStatus.textContent = "Something went wrong. Please try again.";
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "SEND MESSAGE";
        }
    });
}

/* Homepage book catalogue: compact accordion navigation. */
if (document.body.classList.contains("home-page")) {
    const booksSection = document.querySelector("#books");

    if (booksSection) {
        /* This artwork belongs to the Where We Take Root preview, not the homepage. */
        document.querySelector(".home-art-divider")?.remove();

        const accordionStyles = document.createElement("style");
        accordionStyles.textContent = `
            .books-section .book-catalogue-list > .book-group-heading,
            .books-section .book-catalogue-list > .tiny-rule {
                display: none;
            }

            .books-section .book-catalogue-list,
            .books-section .book-group.book-catalogue-accordion {
                max-width: 1240px;
                margin: 0 auto;
            }

            .books-section .book-catalogue-list .book-subgroup,
            .books-section .book-group.book-catalogue-accordion {
                margin: 0;
                padding: 0;
                border-top: 1px solid rgba(207, 177, 139, 0.22);
            }

            .books-section .book-catalogue-list .book-subgroup + .book-subgroup,
            .books-section .book-group.book-catalogue-accordion {
                margin-top: 0;
                padding-top: 0;
            }

            .books-section .book-group.book-catalogue-accordion {
                border-bottom: 1px solid rgba(207, 177, 139, 0.22);
            }

            .book-accordion-toggle {
                position: relative;
                width: 100%;
                min-height: 118px;
                display: block;
                padding: 26px 68px;
                border: 0;
                background: transparent;
                color: var(--cream);
                font: inherit;
                text-align: center;
                cursor: pointer;
                transition: background-color 180ms ease;
            }

            .book-accordion-toggle:hover,
            .book-accordion-toggle:focus-visible {
                background: rgba(229, 221, 209, 0.035);
            }

            .book-accordion-toggle:focus-visible {
                outline: 1px solid var(--gold);
                outline-offset: -5px;
            }

            .book-accordion-copy {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 7px;
                pointer-events: none;
            }

            .book-accordion-kicker {
                color: var(--gold);
                font-family: Montserrat, Arial, sans-serif;
                font-size: 0.68rem;
                font-weight: 400;
                letter-spacing: 0.2em;
                line-height: 1.35;
                text-transform: uppercase;
            }

            .book-accordion-title {
                color: var(--cream);
                font-family: "Cormorant Garamond", Georgia, serif;
                font-size: 1.45rem;
                font-weight: 400;
                letter-spacing: 0.16em;
                line-height: 1.15;
                text-transform: uppercase;
            }

            .book-subgroup-series .book-accordion-title,
            .book-group-series .book-accordion-title {
                font-size: 1.55rem;
                letter-spacing: 0.1em;
                text-transform: none;
            }

            .book-accordion-note {
                max-width: 680px;
                color: var(--muted);
                font-family: "Cormorant Garamond", Georgia, serif;
                font-size: 0.98rem;
                font-style: italic;
                letter-spacing: 0;
                line-height: 1.35;
                text-transform: none;
            }

            .book-accordion-chevron {
                position: absolute;
                top: 50%;
                right: 26px;
                width: 24px;
                height: 24px;
                display: grid;
                place-items: center;
                color: var(--gold);
                font-family: Montserrat, Arial, sans-serif;
                font-size: 1rem;
                line-height: 1;
                transform: translateY(-50%) rotate(0deg);
                transform-origin: center;
                transition: transform 180ms ease;
                pointer-events: none;
            }

            .book-catalogue-accordion.is-open > .book-accordion-toggle .book-accordion-chevron {
                transform: translateY(-50%) rotate(180deg);
            }

            .book-accordion-panel {
                padding-top: 34px;
                padding-bottom: 38px;
            }

            .book-accordion-panel[hidden] {
                display: none !important;
            }

            @media (max-width: 700px) {
                .book-accordion-toggle {
                    min-height: 104px;
                    padding: 22px 48px 22px 18px;
                }

                .book-accordion-title,
                .book-subgroup-series .book-accordion-title,
                .book-group-series .book-accordion-title {
                    font-size: 1.18rem;
                    letter-spacing: 0.1em;
                }

                .book-subgroup-series .book-accordion-title,
                .book-group-series .book-accordion-title {
                    letter-spacing: 0.06em;
                }

                .book-accordion-kicker {
                    font-size: 0.58rem;
                    letter-spacing: 0.14em;
                }

                .book-accordion-note {
                    font-size: 0.9rem;
                    line-height: 1.3;
                }

                .book-accordion-chevron {
                    right: 16px;
                }

                .book-accordion-panel {
                    padding-top: 26px;
                    padding-bottom: 30px;
                }
            }
        `;
        document.head.appendChild(accordionStyles);

        const accordionItems = [];

        const closeAccordion = (item) => {
            item.button.setAttribute("aria-expanded", "false");
            item.panel.hidden = true;
            item.container.classList.remove("is-open");
        };

        const openAccordion = (item) => {
            accordionItems.forEach((otherItem) => {
                if (otherItem !== item) {
                    closeAccordion(otherItem);
                }
            });

            item.button.setAttribute("aria-expanded", "true");
            item.panel.hidden = false;
            item.container.classList.add("is-open");
        };

        const createAccordion = ({ container, heading, kicker, note, panel, id }) => {
            if (!container || !heading || !panel) {
                return;
            }

            container.classList.add("book-catalogue-accordion");

            const button = document.createElement("button");
            button.type = "button";
            button.className = "book-accordion-toggle";
            button.setAttribute("aria-expanded", "false");
            button.setAttribute("aria-controls", id);

            const copy = document.createElement("span");
            copy.className = "book-accordion-copy";

            if (kicker) {
                const kickerText = document.createElement("span");
                kickerText.className = "book-accordion-kicker";
                kickerText.textContent = kicker.textContent.trim();
                copy.appendChild(kickerText);
            }

            const title = document.createElement("span");
            title.className = "book-accordion-title";
            title.textContent = heading.textContent.trim();
            copy.appendChild(title);

            if (note) {
                const noteText = document.createElement("span");
                noteText.className = "book-accordion-note";
                noteText.innerHTML = note.innerHTML;
                copy.appendChild(noteText);
            }

            const chevron = document.createElement("span");
            chevron.className = "book-accordion-chevron";
            chevron.setAttribute("aria-hidden", "true");
            chevron.textContent = "⌄";

            button.append(copy, chevron);
            container.insertBefore(button, container.firstChild);

            heading.remove();
            kicker?.remove();
            note?.remove();

            panel.id = id;
            panel.classList.add("book-accordion-panel");
            panel.hidden = true;

            const item = { container, button, panel };
            accordionItems.push(item);

            button.addEventListener("click", () => {
                const isOpen = button.getAttribute("aria-expanded") === "true";
                if (isOpen) {
                    closeAccordion(item);
                } else {
                    openAccordion(item);
                }
            });
        };

        const bookGroups = Array.from(booksSection.querySelectorAll(":scope > .book-group"));
        const scienceFictionGroup = bookGroups[0];
        const fantasyGroup = bookGroups[1];

        if (scienceFictionGroup) {
            scienceFictionGroup.classList.add("book-catalogue-list");

            const subgroups = Array.from(scienceFictionGroup.querySelectorAll(":scope > .book-subgroup"));
            const worldsThatAnswer = subgroups.find((subgroup) =>
                subgroup.querySelector(":scope > .book-subgroup-heading")?.textContent.trim() === "The Worlds That Answer"
            );

            if (worldsThatAnswer && subgroups[0] !== worldsThatAnswer) {
                scienceFictionGroup.insertBefore(worldsThatAnswer, subgroups[0]);
            }

            const orderedSubgroups = Array.from(scienceFictionGroup.querySelectorAll(":scope > .book-subgroup"));
            orderedSubgroups.forEach((subgroup, index) => {
                createAccordion({
                    container: subgroup,
                    heading: subgroup.querySelector(":scope > .book-subgroup-heading"),
                    kicker: subgroup.querySelector(":scope > .book-subgroup-kicker"),
                    note: subgroup.querySelector(":scope > .book-subgroup-note"),
                    panel: subgroup.querySelector(":scope > .books-layout"),
                    id: `book-accordion-panel-${index + 1}`
                });
            });
        }

        if (fantasyGroup) {
            fantasyGroup.classList.add("book-group-series");

            const fantasyRule = fantasyGroup.querySelector(":scope > .tiny-rule");
            fantasyRule?.remove();

            const fantasyHeading = fantasyGroup.querySelector(":scope > .book-group-heading");
            if (fantasyHeading) {
                fantasyHeading.textContent = "Dragonwake";
            }

            const fantasyKicker = document.createElement("p");
            fantasyKicker.textContent = "A fantasy romance series";

            const fantasyNote = document.createElement("p");
            fantasyNote.innerHTML = "The series begins with <em>The Forty-Fourth Mark</em>.";

            createAccordion({
                container: fantasyGroup,
                heading: fantasyHeading,
                kicker: fantasyKicker,
                note: fantasyNote,
                panel: fantasyGroup.querySelector(":scope > .books-layout"),
                id: "book-accordion-panel-fantasy"
            });
        }
    }
}
