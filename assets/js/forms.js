/* HONEYBEE CAFE - PART 3
   FORM VALIDATION AND RESPONSES */

// Select both forms. Only one exists on each page.
const enquiryForm = document.getElementById("enquiry-form");
const contactForm = document.getElementById("contact-form");

// Displays a success or error message.
function showFormMessage(element, message, type) {
    element.textContent = message;
    element.className = "form-response " + type;
}

// Validates names without allowing numbers.
function validName(name) {
    const namePattern = /^[A-Za-zÀ-ÿ]+([ '-][A-Za-zÀ-ÿ]+)*$/;
    return name.length >= 2 &&
           name.length <= 60 &&
           namePattern.test(name);
}

// Validates phone numbers.
function validPhone(phone) {
    const phonePattern = /^\+?[0-9]{9,15}$/;
    return phonePattern.test(phone);
}

// Displays a field-specific browser validation message.
function rejectField(field, message) {
    field.setCustomValidity(message);
    field.reportValidity();
    field.focus();
}

/* SEND FORM DATA TO FORMSPREE */

// This function can send either the Contact or Enquiry form.
async function sendToFormspree(form) {

    // Collect the values of all enabled form fields.
    const formData = new FormData(form);

    // Send the information to the URL in the form's action.
    const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
            "Accept": "application/json"
        }
    });

    // Check whether Formspree accepted the submission.
    if (!response.ok) {

        // Show a specific message if submissions are rate-limited.
        if (response.status === 429) {
            throw new Error(
                "Too many submissions. Please wait and try again."
            );
        }

        throw new Error(
            "Your information could not be sent. Please try again."
        );
    }
}

// Removes custom errors when the customer edits a field.
document.querySelectorAll(
    "#enquiry-form input, #enquiry-form textarea, " +
    "#enquiry-form select, #contact-form input, " +
    "#contact-form textarea"
).forEach(function(field) {
    field.addEventListener("input", function() {
        field.setCustomValidity("");
    });

    field.addEventListener("change", function() {
        field.setCustomValidity("");
    });
});

/* CONTACT FORM */

if (contactForm) {

    const contactResponse =
        document.getElementById("contact-response");

    contactForm.addEventListener("submit", async function(event) {

        // Stop the browser from submitting or refreshing.
        event.preventDefault();

        contactResponse.textContent = "";
        contactResponse.className = "form-response";

        const nameField = contactForm.elements["name"];
        const emailField = contactForm.elements["email"];
        const phoneField = contactForm.elements["phone"];
        const messageField = contactForm.elements["message"];

        const name = nameField.value.trim();
        const phone = phoneField.value.trim();
        const message = messageField.value.trim();

        // Validate full name.
        if (!validName(name)) {
            rejectField(
                nameField,
                "Enter a name with 2 to 60 letters. Numbers are not allowed."
            );
            return;
        }

        // Validate email.
        if (!emailField.validity.valid) {
            emailField.reportValidity();
            return;
        }

        // Validate phone number.
        if (!validPhone(phone)) {
            rejectField(
                phoneField,
                "Enter 9 to 15 digits, with an optional + at the beginning."
            );
            return;
        }

        // Validate message length.
        if (message.length < 10 || message.length > 500) {
            rejectField(
                messageField,
                "Your message must contain between 10 and 500 characters."
            );
            return;
        }

        /* SEND CONTACT MESSAGE TO FORMSPREE */
// Find the existing Send Message button.
const submitButton = contactForm.querySelector(
    'button[type="submit"]'
);

// Remember the button's original wording.
const originalButtonText = submitButton.textContent;

// Prevent duplicate submissions while sending.
submitButton.disabled = true;
submitButton.textContent = "Sending...";

try {

    // Wait for Formspree to accept the message.
    await sendToFormspree(contactForm);

    // Show a successful submission message.
    showFormMessage(
        contactResponse,
        "Thank you, " + name +
        "! Your message has been submitted successfully.",
        "form-success"
    );

    // Clear the fields only after a successful submission.
    contactForm.reset();

} catch (error) {

    // Keep the entered information if sending fails.
    showFormMessage(
        contactResponse,
        error.message,
        "form-error"
    );

} finally {

    // Restore the Send Message button.
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
}
    });
}

/* ENQUIRY FORM */

if (enquiryForm) {

    // Select the enquiry fields.
    const enquiryResponse = document.getElementById("enquiry-response");
    const nameField = document.getElementById("full-name");
    const phoneField = document.getElementById("phone");
    const typeField = document.getElementById("enquiry-type");

    const orderItems = document.getElementById("order-items");
    const delivery = document.getElementById("delivery");
    const collection = document.getElementById("collection");
    const deliveryAddress = document.getElementById("delivery-address");
    const preferredDate = document.getElementById("preferred-date");
    const preferredTime = document.getElementById("preferred-time");
    const messageField = document.getElementById("message");

    // Select the sections that will appear or disappear.
    const orderSection = document.getElementById("order-section");
    const deliverySection = document.getElementById("delivery-section");
    const dateSection = document.getElementById("date-section");
    const messageSection = document.getElementById("message-section");

    // Get today's date in the visitor's local timezone.
    function getToday() {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return year + "-" + month + "-" + day;
    }

    preferredDate.min = getToday();

    // Shows or hides sections based on the customer's choice.
    function updateEnquiryFields() {

        const type = typeField.value;
        const isOrder = type === "order";
        const isDelivery = isOrder && delivery.checked;
        const hasEnquiry = type !== "";

        // Show the relevant sections.
        orderSection.hidden = !isOrder;
        deliverySection.hidden = !isDelivery;
        dateSection.hidden = !isOrder;
        messageSection.hidden = !hasEnquiry;

        // Require fields only when they are relevant.
        orderItems.required = isOrder;
        deliveryAddress.required = isDelivery;
        preferredDate.required = isOrder;
        preferredTime.required = isOrder;

        // Message is required for non-order enquiries.
        messageField.required = hasEnquiry && !isOrder;

        // Require a delivery or collection choice for orders.
        delivery.required = isOrder && !collection.checked;
        collection.required = isOrder && !delivery.checked;

        // Disable fields inside hidden sections.
        // Disabled fields cannot block form validation.
        orderItems.disabled = !isOrder;
        delivery.disabled = !isOrder;
        collection.disabled = !isOrder;
        deliveryAddress.disabled = !isDelivery;
        preferredDate.disabled = !isOrder;
        preferredTime.disabled = !isOrder;
        messageField.disabled = !hasEnquiry;
    }

    // Update the form when the enquiry type changes.
    typeField.addEventListener("change", function() {

        // Clear previous order choices when switching away.
        if (typeField.value !== "order") {
            delivery.checked = false;
            collection.checked = false;
        }

        enquiryResponse.textContent = "";
        enquiryResponse.className = "form-response";

        updateEnquiryFields();
    });

    // Update the address field when delivery or collection changes.
    delivery.addEventListener("change", updateEnquiryFields);
    collection.addEventListener("change", updateEnquiryFields);

    // Set the initial form state.
    updateEnquiryFields();

    // Validate the form when submitted.
    enquiryForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        enquiryResponse.textContent = "";
        enquiryResponse.className = "form-response";

        updateEnquiryFields();

        // Apply the HTML validation rules.
        if (!enquiryForm.checkValidity()) {
            enquiryForm.reportValidity();
            return;
        }

        const name = nameField.value.trim();
        const phone = phoneField.value.trim();
        const type = typeField.value;

        // Check name validation.
        if (!validName(name)) {
            rejectField(
                nameField,
                "Enter a valid name without numbers."
            );
            return;
        }

        // Check phone number validation.
        if (!validPhone(phone)) {
            rejectField(
                phoneField,
                "Enter 9 to 15 digits, with an optional + at the beginning."
            );
            return;
        }

        // Validate order details.
        if (type === "order") {

            if (orderItems.value.trim().length < 5) {
                rejectField(
                    orderItems,
                    "Please enter at least 5 characters for your order."
                );
                return;
            }

            if (!delivery.checked && !collection.checked) {
                showFormMessage(
                    enquiryResponse,
                    "Please select Delivery or Collection.",
                    "form-error"
                );
                delivery.focus();
                return;
            }

            if (
                delivery.checked &&
                deliveryAddress.value.trim().length < 10
            ) {
                rejectField(
                    deliveryAddress,
                    "Please enter a delivery address of at least 10 characters."
                );
                return;
            }
        }

        // Validate the message for other enquiry types.
        if (type !== "order" && messageField.value.trim().length < 10) {
            rejectField(
                messageField,
                "Please enter at least 10 characters explaining your enquiry."
            );
            return;
        }

        // Prevent dates in the past.
        if (
            !preferredDate.disabled &&
            preferredDate.value < getToday()
        ) {
            rejectField(
                preferredDate,
                "Please select today or a future date."
            );
            return;
        }

        // Display a response relevant to the enquiry.
        let response = "";

        switch (type) {

            case "product-menu":
                response =
                    "You can view our menu and prices on the " +
                    "Products & Services page.";
                break;

            case "order":
                response =
                    "Your order details have passed validation. " +
                    "Please contact the cafe to confirm availability and pricing.";
                break;

            case "visit-availability":
                response =
                    "You can enquire about our opening days, " +
                    "operating hours and the best times to visit HoneyBee Cafe.";
                break;

            case "general":
                response =
                    "Your general enquiry has passed validation.";
                break;
        }

       /* SEND ENQUIRY TO FORMSPREE */
// Find the existing Submit Enquiry button.
const submitButton = enquiryForm.querySelector(
    'button[type="submit"]'
);

// Save the button's original text.
const originalButtonText = submitButton.textContent;

// Prevent duplicate submissions.
submitButton.disabled = true;
submitButton.textContent = "Sending...";

try {

    // Wait for Formspree to accept the enquiry.
    await sendToFormspree(enquiryForm);

    // Display the customer's name and a relevant response.
    showFormMessage(
        enquiryResponse,
        "Thank you, " + name +
        "! Your enquiry has been submitted successfully. " +
        response,
        "form-success"
    );

    // Clear all the Enquiry form fields.
    enquiryForm.reset();

    // Hide the conditional sections again.
    updateEnquiryFields();

} catch (error) {

    // Display an error without clearing the customer's answers.
    showFormMessage(
        enquiryResponse,
        error.message,
        "form-error"
    );

} finally {

    // Restore the original Submit Enquiry button.
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
}
    });
}