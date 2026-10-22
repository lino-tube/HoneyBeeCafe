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

/* PART 3 - MENU SORTING FUNCTIONALITY */

// Selects the new sorting dropdown.
const menuSortSelect = document.getElementById("menu-sort");

// Stores the original order of products in each category.
const originalMenuOrder = new Map();

menuSections.forEach(function(section) {

    // Gets all product cells from this menu category.
    const products = Array.from(
        section.querySelectorAll("table td")
    );

    // Saves their original order so it can be restored later.
    originalMenuOrder.set(section, products);

});

// Runs when the customer selects a sorting option.
menuSortSelect.addEventListener("change", function() {

    // Gets the selected sorting option.
    const sortOption = menuSortSelect.value;

    // Sorts each category separately.
    menuSections.forEach(function(section) {

        // Finds the existing table rows.
        const rows = Array.from(
            section.querySelectorAll("table tr")
        );

        // Remembers how many products belong in each row.
        const rowSizes = rows.map(function(row) {
            return row.querySelectorAll("td").length;
        });

        // Gets a copy of the original product order.
        const products = Array.from(
            originalMenuOrder.get(section)
        );

        // Sorts product names from A to Z.
        if (sortOption === "az") {

            products.sort(function(a, b) {

                const nameA = a.querySelector("p").textContent.trim();
                const nameB = b.querySelector("p").textContent.trim();

                return nameA.localeCompare(nameB, "en", {
                    sensitivity: "base"
                });

            });

        }

        // Sorts product names from Z to A.
        else if (sortOption === "za") {

            products.sort(function(a, b) {

                const nameA = a.querySelector("p").textContent.trim();
                const nameB = b.querySelector("p").textContent.trim();

                return nameB.localeCompare(nameA, "en", {
                    sensitivity: "base"
                });

            });

        }

        // Clears the old positions without deleting products.
        rows.forEach(function(row) {
            row.replaceChildren();
        });

        // Places the products back into the existing table rows.
        let position = 0;

        rows.forEach(function(row, index) {

            // Number of products originally in this row.
            const numberOfProducts = rowSizes[index];

            // Gets the next group of sorted products.
            const rowProducts = products.slice(
                position,
                position + numberOfProducts
            );

            // Moves the existing product cells into this row.
            row.append(...rowProducts);

            position += numberOfProducts;

        });

    });

    // Runs the existing search again after sorting.
    // This allows search and sorting to work together.
    menuSearchInput.dispatchEvent(new Event("input"));

});