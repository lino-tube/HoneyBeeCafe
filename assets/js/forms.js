/* HONEYBEE CAFE - PART 3
   JAVASCRIPT FORM VALIDATION
   AND FORMSPREE INTEGRATION */

// Select the forms.
// Each webpage contains only one of these forms.
const enquiryForm = document.getElementById("enquiry-form");
const contactForm = document.getElementById("contact-form");


/* GENERAL VALIDATION FUNCTIONS */

// Display a success or sending error message.
function showFormMessage(element, message, type) {
    element.textContent = message;
    element.className = "form-response " + type;
}

// Check that a name contains letters instead of numbers.
function validName(name) {
    const namePattern = /^[A-Za-zÀ-ÿ]+([ '-][A-Za-zÀ-ÿ]+)*$/;

    return name.length >= 2 &&
           name.length <= 60 &&
           namePattern.test(name);
}

// Check phone numbers.
// Accept 9 to 15 digits, optionally starting with +.
function validPhone(phone) {
    const phonePattern = /^\+?[0-9]{9,15}$/;
    return phonePattern.test(phone);
}

// Check email addresses.
function validEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}


/* INLINE ERROR MESSAGES */

// Remove previous error messages from a form.
function clearFormErrors(form) {

    // Remove all red error messages.
    form.querySelectorAll(".field-error").forEach(function(error) {
        error.remove();
    });

    // Remove the red borders and accessibility error states.
    form.querySelectorAll(".input-error").forEach(function(field) {
        field.classList.remove("input-error");
        field.removeAttribute("aria-invalid");
        field.removeAttribute("aria-errormessage");
        field.setCustomValidity("");
    });
}


// Display an error beneath the incorrect field.
// The optional group is used for radio buttons.
function rejectField(field, message, group) {

    // Create a text element for the error.
    const error = document.createElement("span");

    error.className = "field-error";
    error.id = field.id + "-error";
    error.textContent = message;

    // Display the error below the field or radio group.
    if (group) {
        group.appendChild(error);
    } else {
        field.insertAdjacentElement("afterend", error);
    }

    // Highlight the incorrect field.
    field.classList.add("input-error");
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-errormessage", error.id);
}


/* SEND INFORMATION TO FORMSPREE */

// Send a validated form to its Formspree endpoint.
async function sendToFormspree(form) {

    // Collect all enabled fields.
    const formData = new FormData(form);

    // Send the information without refreshing the page.
    const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
            "Accept": "application/json"
        }
    });

    // Check whether Formspree accepted the submission.
    if (!response.ok) {

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


/* VALIDATE AGAIN WHEN CUSTOMER EDITS */

// Once Submit has been clicked, update error messages
// as the customer corrects the information.
function revalidateAfterEdit(form, validate) {

    function onEdit() {

        // Only show errors after the first submission attempt.
        if (form.dataset.validationAttempted === "true") {
            validate();
        }
    }

    form.addEventListener("input", onEdit);
    form.addEventListener("change", onEdit);
}


/* CONTACT FORM VALIDATION */

if (contactForm) {

    const contactResponse =
        document.getElementById("contact-response");

    // Select the existing Contact form fields.
    const nameField = contactForm.elements["name"];
    const emailField = contactForm.elements["email"];
    const phoneField = contactForm.elements["phone"];
    const messageTypeField = contactForm.elements["message-type"];
    const messageField = contactForm.elements["message"];


    // Check ALL Contact form fields.
    function validateContactForm() {

        // Clear previous messages before checking again.
        clearFormErrors(contactForm);

        // Store every incorrect field.
        const errors = [];

        function addError(field, message) {
            rejectField(field, message);
            errors.push(field);
        }


        // Validate full name.
        const name = nameField.value.trim();

        if (!name) {
            addError(nameField, "Please enter your full name.");
        }
        else if (!validName(name)) {
            addError(
                nameField,
                "Enter a name with 2 to 60 letters. Numbers are not allowed."
            );
        }


        // Validate email address.
        const email = emailField.value.trim();

        if (!email) {
            addError(emailField, "Please enter your email address.");
        }
        else if (!validEmail(email)) {
            addError(emailField, "Please enter a valid email address.");
        }


        // Validate phone number.
        const phone = phoneField.value.trim();

        if (!phone) {
            addError(phoneField, "Please enter your phone number.");
        }
        else if (!validPhone(phone)) {
            addError(
                phoneField,
                "Enter 9 to 15 digits, with an optional + at the beginning."
            );
        }


        // Validate the message type dropdown.
        if (!messageTypeField.value) {
            addError(
                messageTypeField,
                "Please select a message type."
            );
        }


        // Validate the customer's message.
        const message = messageField.value.trim();

        if (!message) {
            addError(messageField, "Please enter your message.");
        }
        else if (message.length < 10 || message.length > 500) {
            addError(
                messageField,
                "Your message must contain between 10 and 500 characters."
            );
        }

        // Return all incorrect fields together.
        return errors;
    }


    // Recheck the form when customers correct information.
    revalidateAfterEdit(contactForm, validateContactForm);


    /* CONTACT FORM SUBMISSION */

    contactForm.addEventListener("submit", async function(event) {

        // Prevent page refresh and automatic submission.
        event.preventDefault();

        const submitButton = contactForm.querySelector(
            'button[type="submit"]'
        );

        // Do not submit twice while sending.
        if (submitButton.disabled) {
            return;
        }

        contactResponse.textContent = "";
        contactResponse.className = "form-response";

        // Remember that the customer has attempted submission.
        contactForm.dataset.validationAttempted = "true";

        // Display ALL errors before deciding whether to send.
        const errors = validateContactForm();

        if (errors.length > 0) {

            // Focus on the first incorrect field,
            // but keep all error messages visible.
            errors[0].focus();
            return;
        }

        const name = nameField.value.trim();

        const originalButtonText = submitButton.textContent;

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        try {

            // Send to the existing Contact Formspree endpoint.
            await sendToFormspree(contactForm);

            // Display confirmation after Formspree accepts it.
            showFormMessage(
                contactResponse,
                "Thank you, " + name +
                "! Your message has been submitted successfully.",
                "form-success"
            );

            // Clear the form after successful sending.
            contactForm.reset();
            clearFormErrors(contactForm);

            // Reset the validation state.
            delete contactForm.dataset.validationAttempted;

        } catch (error) {

            // Keep customer information if sending fails.
            showFormMessage(
                contactResponse,
                error.message,
                "form-error"
            );

        } finally {

            // Restore the submit button.
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
}


/* ENQUIRY FORM VALIDATION */

if (enquiryForm) {

    const enquiryResponse =
        document.getElementById("enquiry-response");

    // Customer information.
    const nameField = enquiryForm.elements["full-name"];
    const emailField = enquiryForm.elements["email"];
    const phoneField = enquiryForm.elements["phone"];
    const typeField = enquiryForm.elements["enquiry-type"];

    // Order information.
    const orderItems = enquiryForm.elements["order-items"];
    const delivery = document.getElementById("delivery");
    const collection = document.getElementById("collection");
    const deliveryAddress = enquiryForm.elements["delivery-address"];
    const preferredDate = enquiryForm.elements["preferred-date"];
    const preferredTime = enquiryForm.elements["preferred-time"];
    const messageField = enquiryForm.elements["message"];

    // Conditional sections.
    const orderSection = document.getElementById("order-section");
    const deliverySection = document.getElementById("delivery-section");
    const dateSection = document.getElementById("date-section");
    const messageSection = document.getElementById("message-section");


    /* GET TODAY'S DATE */

    function getToday() {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return year + "-" + month + "-" + day;
    }

    preferredDate.min = getToday();


    /* DISPLAY RELEVANT ENQUIRY FIELDS */

    function updateEnquiryFields() {

        const type = typeField.value;

        const isOrder = type === "order";
        const isDelivery = isOrder && delivery.checked;
        const hasEnquiry = type !== "";

        // Show or hide the relevant sections.
        orderSection.hidden = !isOrder;
        deliverySection.hidden = !isDelivery;
        dateSection.hidden = !isOrder;
        messageSection.hidden = !hasEnquiry;

        // Update required fields.
        orderItems.required = isOrder;
        deliveryAddress.required = isDelivery;
        preferredDate.required = isOrder;
        preferredTime.required = isOrder;

        // Message required for non-order enquiries.
        messageField.required = hasEnquiry && !isOrder;

        // Order customers must choose Delivery or Collection.
        delivery.required = isOrder;
        collection.required = isOrder;

        // Disable hidden or irrelevant fields.
        // Formspree will not receive disabled fields.
        orderItems.disabled = !isOrder;
        delivery.disabled = !isOrder;
        collection.disabled = !isOrder;
        deliveryAddress.disabled = !isDelivery;
        preferredDate.disabled = !isOrder;
        preferredTime.disabled = !isOrder;
        messageField.disabled = !hasEnquiry;
    }


    /* UPDATE SECTIONS WHEN CUSTOMER CHANGES SELECTION */

    typeField.addEventListener("change", function() {

        if (typeField.value !== "order") {
            delivery.checked = false;
            collection.checked = false;
        }

        enquiryResponse.textContent = "";
        enquiryResponse.className = "form-response";

        updateEnquiryFields();
    });

    delivery.addEventListener("change", updateEnquiryFields);
    collection.addEventListener("change", updateEnquiryFields);

    // Set the initial state when the page opens.
    updateEnquiryFields();


    /* VALIDATE ALL RELEVANT ENQUIRY FIELDS */

    function validateEnquiryForm() {

        updateEnquiryFields();
        clearFormErrors(enquiryForm);

        // Store all incorrect fields.
        const errors = [];

        function addError(field, message, group) {
            rejectField(field, message, group);
            errors.push(field);
        }


        // Validate full name.
        const name = nameField.value.trim();

        if (!name) {
            addError(nameField, "Please enter your full name.");
        }
        else if (!validName(name)) {
            addError(
                nameField,
                "Enter a name with 2 to 60 letters. Numbers are not allowed."
            );
        }


        // Validate email address.
        const email = emailField.value.trim();

        if (!email) {
            addError(emailField, "Please enter your email address.");
        }
        else if (!validEmail(email)) {
            addError(emailField, "Please enter a valid email address.");
        }


        // Validate phone number.
        const phone = phoneField.value.trim();

        if (!phone) {
            addError(phoneField, "Please enter your phone number.");
        }
        else if (!validPhone(phone)) {
            addError(
                phoneField,
                "Enter 9 to 15 digits, with an optional + at the beginning."
            );
        }


        // Validate enquiry type.
        const type = typeField.value;

        if (!type) {
            addError(
                typeField,
                "Please select an enquiry type."
            );
        }


        /* ORDER ENQUIRY VALIDATION */

        if (type === "order") {

            // Check ordered items.
            const items = orderItems.value.trim();

            if (!items) {
                addError(
                    orderItems,
                    "Please enter the items you want to order."
                );
            }
            else if (items.length < 5 || items.length > 300) {
                addError(
                    orderItems,
                    "Order details must contain between 5 and 300 characters."
                );
            }


            // Check Delivery or Collection selection.
            if (!delivery.checked && !collection.checked) {

                // Place error below the radio-button group.
                addError(
                    delivery,
                    "Please select Delivery or Collection.",
                    delivery.closest("fieldset")
                );
            }


            // Delivery address required only for Delivery.
            if (delivery.checked) {

                const address = deliveryAddress.value.trim();

                if (!address) {
                    addError(
                        deliveryAddress,
                        "Please enter your delivery address."
                    );
                }
                else if (address.length < 10 || address.length > 200) {
                    addError(
                        deliveryAddress,
                        "Delivery address must contain 10 to 200 characters."
                    );
                }
            }


            // Validate preferred date.
            if (!preferredDate.value) {
                addError(
                    preferredDate,
                    "Please select a preferred date."
                );
            }
            else if (preferredDate.value < getToday()) {
                addError(
                    preferredDate,
                    "Please choose today or a future date."
                );
            }


            // Validate preferred time.
            if (!preferredTime.value) {
                addError(
                    preferredTime,
                    "Please select a preferred time."
                );
            }
        }


        /* MESSAGE VALIDATION */

        if (type) {

            const message = messageField.value.trim();

            // Required for Product, Visit and General enquiries.
            if (!message && type !== "order") {
                addError(
                    messageField,
                    "Please enter a message explaining your enquiry."
                );
            }

            // Optional for orders, but check its length if filled in.
            else if (
                message &&
                (message.length < 10 || message.length > 500)
            ) {
                addError(
                    messageField,
                    "Your message must contain between 10 and 500 characters."
                );
            }
        }

        // Return ALL errors together.
        return errors;
    }


    // Revalidate when the customer corrects information.
    revalidateAfterEdit(enquiryForm, validateEnquiryForm);


    /* ENQUIRY FORM SUBMISSION */

    enquiryForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const submitButton = enquiryForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton.disabled) {
            return;
        }

        enquiryResponse.textContent = "";
        enquiryResponse.className = "form-response";

        enquiryForm.dataset.validationAttempted = "true";

        // Check all relevant fields before sending anything.
        const errors = validateEnquiryForm();

        if (errors.length > 0) {
            errors[0].focus();
            return;
        }

        const name = nameField.value.trim();
        const type = typeField.value;

        // Prepare a response based on the selected enquiry.
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
                    "You can enquire about our opening days, operating hours " +
                    "and the best times to visit HoneyBee Cafe.";
                break;

            case "general":
                response =
                    "Your general enquiry has passed validation.";
                break;
        }


        // Disable the button while sending.
        const originalButtonText = submitButton.textContent;

        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        try {

            // Send to the existing Enquiry Formspree endpoint.
            await sendToFormspree(enquiryForm);

            // Display confirmation after successful sending.
            showFormMessage(
                enquiryResponse,
                "Thank you, " + name +
                "! Your enquiry has been submitted successfully. " +
                response,
                "form-success"
            );

            // Clear all fields.
            enquiryForm.reset();

            // Hide the conditional sections.
            updateEnquiryFields();

            // Remove any remaining errors.
            clearFormErrors(enquiryForm);

            // Reset validation state.
            delete enquiryForm.dataset.validationAttempted;

        } catch (error) {

            // Keep the entered answers if sending fails.
            showFormMessage(
                enquiryResponse,
                error.message,
                "form-error"
            );

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
}