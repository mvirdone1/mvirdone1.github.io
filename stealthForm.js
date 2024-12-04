class stealthForm {
  constructor(parentElement, formButtonTitle, submitButtonCallback) {
    this.stealthFormDivId = divify(parentElement.id) + "-stealth-form";
    // this.stationDataTemplate = [];
    stealthForm.instance = this;

    const addChartButton = document.createElement("button");
    addChartButton.id = this.stealthFormDivId + "-button";
    addChartButton.textContent = formButtonTitle;

    parentElement.appendChild(document.createElement("br"));
    parentElement.appendChild(addChartButton);
    const formParentContainer = document.createElement("div");
    formParentContainer.id = this.stealthFormDivId;
    parentElement.appendChild(formParentContainer);

    const stealthFormDivContainerId = this.stealthFormDivId + "-container";

    // Add event listener to dynamically create the form when the button is clicked
    addChartButton.addEventListener("click", function () {
      formContainer.style.display = "block";
    });

    // Create container for the form
    const formContainer = document.createElement("div");
    formContainer.id = stealthFormDivContainerId;
    // formContainer.style.display = "none";

    formContainer.style.border = "1px solid #ccc";
    formContainer.style.padding = "10px";
    formContainer.style.marginTop = "10px";
    formContainer.style.backgroundColor = "#f9f9f9";

    const submitButtonId = this.stealthFormDivId + "-submit";
    const cancelButtonId = this.stealthFormDivId + "-cancel";

    // Add initial form HTML
    formContainer.innerHTML = `
    <h3>Dashboard Charts</h3>
    <div id="charts-form-list"></div>
    <button id="${submitButtonId}">Submit</button>
    <button id="${cancelButtonId}">Cancel</button>
  `;

    // Append to parent div
    formParentContainer.appendChild(formContainer);

    // Create the submit button
    document
      .getElementById(submitButtonId)
      .addEventListener("click", function () {
        submitButtonCallback("Hello");
        // formContainer.remove();
        formContainer.style.display = "none";
      });

    // Event listener for cancel button
    document
      .getElementById(cancelButtonId)
      .addEventListener("click", function () {
        // formContainer.remove();
        console.log("Clicked Cancel");
        formContainer.style.display = "none";
      });
  }

  addCustomButton(buttonTitle, customButtonCallback) {
    const customButtonId = this.stealthFormDivId + "-" + divify(buttonTitle);
    const stealthFormDivContainerId = this.stealthFormDivId + "-container";

    document.getElementById(
      stealthFormDivContainerId
    ).innerHTML += ` <button id="${customButtonId}">${buttonTitle}</button>`;

    document
      .getElementById(customButtonId)
      .addEventListener("click", function () {
        customButtonCallback(stealthForm.instance);
      });
  }

  getStealthFormDivId() {
    return this.stealthFormDivId;
  }
}
