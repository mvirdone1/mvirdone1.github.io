function buildDynamicSlider(sliderId, minLabelText, maxLabelText, sliderCallback) {

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = 0;
    slider.max = 1000; // high resolution steps
    slider.value = 0;
    slider.style.width = "100%";
    slider.id = sliderId;

    // Listener for manual slider changes
    slider.addEventListener("input", () => {
        sliderCallback(slider);

    });

    slider.addEventListener("input", () => {
        sliderCallback(slider);

    });


    // Create container for slider + labels
    const sliderContainer = document.createElement("div");
    sliderContainer.style.margin = "10px 0";

    // Label row
    const labelRow = document.createElement("div");
    labelRow.style.display = "flex";
    labelRow.style.justifyContent = "space-between";
    labelRow.style.fontSize = "0.8em";

    // Min/Max labels
    const minLabel = document.createElement("span");
    minLabel.textContent = minLabelText;

    const maxLabel = document.createElement("span");
    maxLabel.textContent = maxLabelText;

    labelRow.appendChild(minLabel);
    labelRow.appendChild(maxLabel);

    // Floating “current time” label
    const currentTimeLabel = document.createElement("div");
    currentTimeLabel.style.textAlign = "center";
    currentTimeLabel.style.marginTop = "4px";
    currentTimeLabel.style.fontWeight = "bold";


    sliderContainer.appendChild(labelRow);
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(currentTimeLabel);

    return sliderContainer;



}


function buildDropdown(options, id = "") {
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

    select.id = id;

    return select;


}

function addFormLabel(labelText, id = "") {
    const formLabel = document.createElement("label");
    formLabel.textContent = labelText;
    return formLabel;
}

function addColorPicker(colorHex = "#0000c0", id = "") {

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.id = id;
    colorInput.value = colorHex; // e.g. "#ff0000"

    return colorInput; // in case you want to attach listeners
}

function addShortTextInput(initalValue = "", id = "") {
    const shortTextInput = document.createElement("input");
    shortTextInput.type = "text";
    shortTextInput.id = id;
    shortTextInput.value = initalValue;

    return shortTextInput;

}

function addPercentSliderBar(initialValue = null, minValue = 0, maxValue = 100, id = "") {

    /*
            <label>Transparency:</label>
        <input type="range" id="radiusT${idx}" min="0" max="100" value="${transparencyPercent}">
        <span id="radiusTLabel${idx}">${transparencyPercent}%</span><br></br>
*/

    const sliderInput = document.createElement("input");
    sliderInput.type = "range";
    sliderInput.id = id;
    sliderInput.min = minValue;
    sliderInput.max = maxValue;
    sliderInput.value = initialValue || (maxValue - minValue) / 2;
    return sliderInput;

}

function updateSliderDisplay(relatedSliderId = null) {
    // If there isn't a related slider, then get out
    if (!relatedSliderId) { return }
    const sliderNumberElementId = relatedSliderId + "-label";
    const relatedslider = document.getElementById(relatedSliderId);
    const sliderNumberElement = document.getElementById(sliderNumberElementId);

    sliderNumberElement.textContent = relatedslider.value + "%";


}

function addPercentSliderDisplay(relatedSliderId = null) {
    // If there isn't a related slider, then get out
    if (!relatedSliderId) { return }

    const sliderNumberElement = document.createElement("span");
    sliderNumberElement.id = relatedSliderId + "-label";

    const relatedslider = document.getElementById(relatedSliderId);
    relatedslider.addEventListener('input', () => {
        updateSliderDisplay(relatedSliderId);
    });

    return sliderNumberElement;

    /*

            <span id="radiusTLabel${idx}">${transparencyPercent}%</span><br>


        const slider = document.getElementById(`radiusT${idx}`);
    const label = document.getElementById(`radiusTLabel${idx}`);
    slider.addEventListener('input', () => {
      label.textContent = slider.value + "%";
    });
    */
}

// usage:
// addColorPicker(document.getElementById("someContainer"), 3, "#00ff88");
