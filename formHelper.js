function buildDropdown(options) {
    /*
        // Dropdown options
        const options = [
        { value: "intersect", text: "New Intersect" },
        { value: "union-auto", text: "New Union Automatic" },
        { value: "union-manual", text: "New Union Manual" }
    ];
    */


    // Create the <select> (dropdown)
    const select = document.createElement("select");

    // Add options to the <select>
    options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.text;
        select.appendChild(option);
    });

    return select;


}