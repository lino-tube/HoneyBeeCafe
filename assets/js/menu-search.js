/* HONEYBEE CAFE - MENU SEARCH AND FILTERING */

// Selects the search input and results message.
const menuSearchInput = document.getElementById("menu-search-input");
const menuSearchStatus = document.getElementById("menu-search-status");

// Selects the three existing menu sections.
const menuSections = document.querySelectorAll(
    "#drinks, #light-meals, #pastries"
);

// Filters products whenever the customer types.
menuSearchInput.addEventListener("input", function() {

    // Removes extra spaces and ignores capital letters.
    const searchText = menuSearchInput.value.trim().toLowerCase();

    // Counts the number of matching products.
    let matchCount = 0;

    // Checks each menu section separately.
    menuSections.forEach(function(section) {

        const rows = section.querySelectorAll("table tr");
        let sectionMatches = 0;

        rows.forEach(function(row) {

            const products = row.querySelectorAll("td");
            let rowMatches = 0;

            products.forEach(function(product) {

                // Uses the first paragraph as the product name.
                const nameElement = product.querySelector("p");

                if (!nameElement) {
                    return;
                }

                const productName =
                    nameElement.textContent.toLowerCase();

                // Checks whether the name contains the search text.
                const matches = productName.includes(searchText);

                // Shows matching products and hides the others.
                product.hidden = !matches;

                if (matches) {
                    matchCount++;
                    sectionMatches++;
                    rowMatches++;
                }

            });

            // Hides a table row if none of its products match.
            row.hidden = rowMatches === 0;

        });

        // Hides a whole category if it has no matching products.
        section.hidden = sectionMatches === 0;

    });

    // Displays a message about the search results.
    if (searchText === "") {
        menuSearchStatus.textContent = "";
    } else if (matchCount === 0) {
        menuSearchStatus.textContent =
            "No menu items found. Please try another search.";
    } else {
        menuSearchStatus.textContent =
            matchCount + " menu item(s) found.";
    }

});