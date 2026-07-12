const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".main-nav");

if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            nav.classList.remove("open");
            menuButton.setAttribute("aria-expanded", "false");
        });
    });
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
