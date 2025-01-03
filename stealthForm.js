// The callback function must take this instance as the first argument, and then any optional arguments as the second argument

class stealthForm {
  constructor(
    parentElement,
    formButtonTitle,
    formHeadingTitle,
    callbackFunction,
    callbackArguments
  ) {
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
    addChartButton.addEventListener("click", () => {
      // Only add stuff to the form if it's not showing
      if (formContainer.style.display != "block") {
        // formContainer.innerHTML = "";
        document.getElementById(this.getStealthFormContentId()).innerHTML = "";
        callbackFunction(this, callbackArguments);
        formContainer.style.display = "block";
        addChartButton.style.display = "none";
      }
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
    formContainer.innerHTML = `    <h3>${formHeadingTitle}</h3>`;

    formParentContainer.appendChild(formContainer);

    const formContent = document.createElement("div");
    formContent.id = this.getStealthFormContentId();
    formContainer.appendChild(formContent);
  }

  hideForm() {
    const stealthFormDivContainerId = this.stealthFormDivId + "-container";
    document.getElementById(this.stealthFormDivId + "-button").style.display =
      "block";
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

  getStealthFormButtonId() {
    return this.stealthFormDivId + "-button";
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
