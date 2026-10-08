/* HONEYBEE CAFE - MENU IMAGE LIGHTBOX */

// Selects the lightbox elements from the HTML.
const lightbox = document.getElementById("menu-lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const closeButton = document.getElementById("lightbox-close");

// Selects only the menu photographs, not the website logo.
const menuImages = document.querySelectorAll(
    "#drinks img, #light-meals img, #pastries img"
);

// Remembers which element was selected before opening.
let previousFocus = null;

// Opens the lightbox when a menu photograph is selected.
function openLightbox(image) {
    previousFocus = document.activeElement;

    // Displays the selected photograph and its description.
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;

    // Makes the lightbox visible.
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");

    // Prevents scrolling behind the enlarged photograph.
    document.body.classList.add("lightbox-open");

    // Moves keyboard focus to the close button.
    closeButton.focus();
}

// Closes the lightbox and restores the page.
function closeLightbox() {
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");

    document.body.classList.remove("lightbox-open");

    // Clears the enlarged photograph.
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";

    // Returns keyboard focus to the previously selected element.
    if (previousFocus) {
        previousFocus.focus();
    }
}

// Makes each menu photograph interactive.
menuImages.forEach(function(image) {
    image.classList.add("menu-photo-clickable");

    // Allows keyboard users to select the photographs.
    image.setAttribute("tabindex", "0");
    image.setAttribute("role", "button");
    image.setAttribute(
        "aria-label",
        "Enlarge photograph: " + image.alt
    );

    // Opens the photograph when clicked.
    image.addEventListener("click", function() {
        openLightbox(image);
    });

    // Opens the photograph with Enter or Space.
    image.addEventListener("keydown", function(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openLightbox(image);
        }
    });
});

// Closes the lightbox when the close button is clicked.
closeButton.addEventListener("click", closeLightbox);

// Closes the lightbox when clicking the dark background.
lightbox.addEventListener("click", function(event) {
    if (event.target === lightbox) {
        closeLightbox();
    }
});

// Closes the lightbox when Escape is pressed.
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && !lightbox.hidden) {
        closeLightbox();
    }

    // Keeps keyboard focus inside the open lightbox.
    if (event.key === "Tab" && !lightbox.hidden) {
        event.preventDefault();
        closeButton.focus();
    }
});