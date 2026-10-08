/* HONEYBEE CAFE - FAQ ACCORDION */
// Selects all FAQ question buttons.

const faqQuestions = document.querySelectorAll(".faq-question");

// Adds click functionality to every question.

faqQuestions.forEach(function(question) {

    question.addEventListener("click", function() {

        // Finds the answer belonging to this question.

        const answer = question.nextElementSibling;

        // Checks whether the question is currently open.

        const isOpen =

            question.getAttribute("aria-expanded") === "true";

        // Closes all questions before opening another.

        faqQuestions.forEach(function(otherQuestion) {

            otherQuestion.setAttribute("aria-expanded", "false");

            otherQuestion.nextElementSibling.hidden = true;

            otherQuestion.querySelector(".faq-icon").textContent = "+";

        });

        // Opens the selected question if it was closed.

        if (!isOpen) {

            question.setAttribute("aria-expanded", "true");

            answer.hidden = false;

            question.querySelector(".faq-icon").textContent = "−";

        }

    });

});