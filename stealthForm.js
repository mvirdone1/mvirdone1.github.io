class stealthForm {
  constructor(parentElement, formButtonTitle) {
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

    const stealthFormDivContainerId = this.getStealthFormContainerId();

    // Add event listener to dynamically create the form when the button is clicked
    addChartButton.addEventListener("click", function () {
      formContainer.style.display = "block";
    });

    // Create container for the form
    const formContainer = document.createElement("div");
    formContainer.id = stealthFormDivContainerId;
    formContainer.style.display = "none";

    formContainer.style.border = "1px solid #ccc";
    formContainer.style.padding = "10px";
    formContainer.style.marginTop = "10px";
    formContainer.style.backgroundColor = "#f9f9f9";

    const submitButtonId = this.stealthFormDivId + "-submit";
    const cancelButtonId = this.stealthFormDivId + "-cancel";

    // Add initial form HTML
    formContainer.innerHTML = "    <h3>Dashboard Charts</h3>";

    formParentContainer.appendChild(formContainer);

    const formContent = document.createElement("div");
    formContent.id = this.getStealthFormContentId();
    formContainer.appendChild(formContent);
  }

  hideForm() {
    const stealthFormDivContainerId = this.stealthFormDivId + "-container";
    document.getElementById(stealthFormDivContainerId).style.display = "none";
  }
  showForm() {
    const stealthFormDivContainerId = this.stealthFormDivId + "-container";
    document.getElementById(stealthFormDivContainerId).style.display = "block";
  }

  addCustomButton(buttonTitle, customButtonCallback) {
    const customButton = document.createElement("button");
    customButton.id = this.stealthFormDivId + "-" + divify(buttonTitle);
    customButton.textContent = buttonTitle;
    customButton.style.marginRight = "10px";
    customButton.addEventListener("click", () => {
      customButtonCallback(this);
    });

    const stealthFormDivContainerId = this.getStealthFormContainerId();
    document
      .getElementById(stealthFormDivContainerId)
      .appendChild(customButton);
  }

  addCustomButton2(buttonTitle, customButtonCallback) {
    const customButtonId = this.stealthFormDivId + "-" + divify(buttonTitle);
    const stealthFormDivContainerId = this.getStealthFormContainerId();

    document.getElementById(
      stealthFormDivContainerId
    ).innerHTML += ` <button id="${customButtonId}">${buttonTitle}</button>`;

    document
      .getElementById(customButtonId)
      .addEventListener("click", function () {
        customButtonCallback(this);
      });
  }

  getStealthFormContentId() {
    return this.stealthFormDivId + "-content";
  }

  getStealthFormContainerId() {
    return this.stealthFormDivId + "-container";
  }

  getStealthFormDivId() {
    return this.stealthFormDivId;
  }
}
