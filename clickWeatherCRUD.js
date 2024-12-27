const myCRUDHelper = {
  buildGenericFormRow: function (fieldAttributes, formObject, parentElement) {
    fieldAttributes.forEach((field) => {
      const {
        type,
        key,
        width,
        placeholder,
        options,
        readOnly,
        transform,
        defaultValue,
      } = field;

      let fieldElement;
      switch (type) {
        case "text":
          fieldElement = document.createElement("div");
          fieldElement.textContent = formObject[key] || defaultValue || "";
          fieldElement.style.width = width;
          fieldElement.style.textAlign = "center";
          break;

        case "input":
          fieldElement = document.createElement("input");
          fieldElement.type = "text";
          fieldElement.placeholder = placeholder || "";
          fieldElement.style.width = width;
          fieldElement.value = formObject[key] || "";
          break;

        case "number":
          fieldElement = document.createElement("input");
          fieldElement.type = "number";
          fieldElement.placeholder = placeholder || "";
          fieldElement.style.width = width;
          fieldElement.value = formObject[key] || "";
          break;

        case "radioGroup":
          fieldElement = document.createElement("div");
          fieldElement.style.display = "flex";
          fieldElement.style.gap = "5px";
          fieldElement.style.width = width;

          options.forEach(({ value, label }) => {
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = `offset-${formObject[fieldElement.uuidKey]}`;
            radio.value = value;
            radio.checked =
              formObject[key] === value ||
              (!formObject[key] && value === false);

            fieldElement.appendChild(radio);
            fieldElement.appendChild(document.createTextNode(label));
          });
          break;

        case "select":
          fieldElement = document.createElement("select");
          fieldElement.style.width = width;

          options.forEach(({ value, label }) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = label;
            option.selected = formObject[key] == value; // Match loosely to allow string/int comparison
            fieldElement.appendChild(option);
          });
          break;

        case "actions":
          // do nothing?
          break;

        case "hidden":
          fieldElement = document.createElement("input");
          fieldElement.type = "hidden";
          fieldElement.name = key;
          fieldElement.value = transform
            ? transform(formObject[key])
            : formObject[key] || "";
          break;

        default:
          console.warn(`Unknown field type: ${type}`);
      }

      if (fieldElement) parentElement.appendChild(fieldElement);
    });
  },
};

const clickWeatherChartCRUD = {
  createWeatherChartStealthCRUD: function (
    contentElement,
    clickWeatherManagerInstance
  ) {
    const chartStealthFormInstance = new stealthForm(
      contentElement,
      "Manage Charts",
      "Historical Chart Attributes",
      this.updateChartFormList.bind(this),
      clickWeatherManagerInstance
    );

    chartStealthFormInstance.addCustomButton(
      "Submit",
      this.stealthFormSubmitChartCallback.bind(this)
    );
    chartStealthFormInstance.addCustomButton(
      "Cancel",
      this.stealthFormCancelChartCallback.bind(this)
    );
    chartStealthFormInstance.addCustomButton(
      "Add Table",
      this.stealthFormAddChartCallback.bind(this)
    );
  },

  stealthFormAddChartCallback: function (stealthFormInstance) {
    console.log("Add Table Click");
    console.log(stealthFormInstance);

    // Get the div element where the form content is going to reside
    const formContentDiv = document.getElementById(
      stealthFormInstance.getStealthFormContentId()
    );

    this.tableFormPrintTableRow(formContentDiv);
  },

  stealthFormCancelChartCallback: function (stealthFormInstance) {
    console.log("Cancelled");
    stealthFormInstance.hideForm();
  },

  parseChartRows: function (stealthFormInstance) {
    const formContentDiv = document.getElementById(
      stealthFormInstance.getStealthFormContentId()
    );

    const rows = Array.from(formContentDiv.children).slice(1); // Skip the header row
    const chartData = rows.map((row) => {
      const inputs = row.querySelectorAll("input, select");

      // console.log(inputs);

      // Parse the string for the table metadata in the hidden element
      const tempTableArray = [];
      if (inputs[6].value.trim()) {
        inputs[6].value
          .split(",")
          .map((tableItem) =>
            tempTableArray.push({ hours: parseInt(tableItem) })
          );
      }

      // console.log(tempTableArray);

      var tempOffsetType = false;
      if (parseInt(inputs[2].value) === 1) {
        tempOffsetType = true;
      }
      // Parse individual inputs and dropdowns
      return {
        title: inputs[0]?.value || "", // Chart Subtitle
        // title: row.children[0].textContent.trim(), // Non-editable title
        // shortTitle: inputs[0]?.value || "", // Chart Subtitle
        days: parseInt(inputs[1]?.value, 10) || 5, // Days
        offset: parseInt(inputs[2]?.value, 10) === 1, // Offset Type drop down
        chartType: parseInt(inputs[3].value, 10) || 0, // Chart Type (select)
        radiusMiles: parseFloat(inputs[4]?.value) || 5, // Radius Miles
        radiusStations: parseInt(inputs[5]?.value, 10) || 20, // Radius Stations
        tables: tempTableArray,
      };
    });

    return chartData;
  },

  stealthFormSubmitChartCallback: function (stealthFormInstance) {
    console.log("Submitted");

    // Clear the chart list
    myClickWeatherManager.setDefinedCharts([]);

    // Push all the charts we have in the list into the weather manager's chart list
    this.parseChartRows(stealthFormInstance).forEach((attributes) => {
      myClickWeatherManager.pushAttributesToDefinedCharts(attributes);
    });

    // If the user has submitted the form, this is now a custom chart
    myClickWeatherManager.setChartMode(CHART_MODES.custom);

    stealthFormInstance.hideForm();

    const positionAttributes = myClickWeatherManager.getPositionAttributes();

    // Need to figure out how to handle stations
    clickWeatherClickListener(
      {
        lat: positionAttributes.position.lat,
        lng: positionAttributes.position.lon,
      },
      false,
      []
    );
  },

  // Main function
  updateChartFormList: function (stealthFormInstance) {
    // Get the div element where the form content is going to reside
    const formContentDiv = document.getElementById(
      stealthFormInstance.getStealthFormContentId()
    );

    let isFirstRow = true;

    myClickWeatherManager.getDefinedCharts().forEach((currentChart) => {
      this.chartFormPrintChartRow(formContentDiv, currentChart, isFirstRow);
      isFirstRow = false; // After the first row, no need for headers
    });
  },

  chartFormPrintChartRow: function (
    formContentDiv,
    currentChart = {},
    isFirstRow = false
  ) {
    // Create a wrapper div for the chart row
    const chartRow = document.createElement("div");
    chartRow.style.display = "flex";
    chartRow.style.gap = "10px";
    chartRow.style.alignItems = "center";
    chartRow.style.marginBottom = "10px";

    const FIELD_CONFIG = [
      {
        type: "text",
        label: "Full Chart Title",
        width: "350px",
        key: "fullTitle",
        readOnly: true,
        placeholder: "New Chart",
        defaultValue: "New Chart",
      },
      {
        type: "input",
        label: "Chart Subtitle",
        width: "150px",
        key: "title",
        placeholder: "Title",
      },
      {
        type: "number",
        label: "Days",
        width: "60px",
        key: "days",
        placeholder: "Days",
      },
      {
        type: "select",
        label: "Offset Type",
        width: "180px",
        key: "offset",
        options: Object.entries(DATA_TYPES_READABLE).map(([key, label]) => ({
          value: key,
          label,
        })),
      },
      {
        type: "select",
        label: "Chart Type",
        width: "190px",
        key: "dataType",
        options: Object.entries(CHART_TYPE_READABLE).map(([key, label]) => ({
          value: key,
          label,
        })),
      },
      {
        type: "number",
        label: "Radius Miles",
        width: "60px",
        key: "radiusMiles",
        placeholder: "Miles",
      },
      {
        type: "number",
        label: "Radius Stations",
        width: "60px",
        key: "radiusStations",
        placeholder: "Num Stations",
      },
      {
        type: "hidden",
        label: "Chart Tables",
        key: "tables",
        transform: (tables) =>
          tables?.map((table) => table.hours).join(",") || "",
      },
      {
        type: "actions",
        label: "Actions",
        width: "auto",
      },
    ];

    if (isFirstRow) {
      // Create a header row with labels
      const headerRow = document.createElement("div");
      headerRow.style.display = "flex";
      headerRow.style.gap = "10px";
      headerRow.style.alignItems = "center";
      headerRow.style.fontWeight = "bold";
      headerRow.style.marginBottom = "10px";

      FIELD_CONFIG.forEach(({ label, width, type }) => {
        if (type != "hidden") {
          const labelDiv = document.createElement("div");
          labelDiv.textContent = label;
          labelDiv.style.width = width;
          labelDiv.style.textAlign = "center"; // Align text with inputs
          headerRow.appendChild(labelDiv);
        }
      });

      // Append the header row to the form
      formContentDiv.appendChild(headerRow);
    } // END if (isFirstRow)

    myCRUDHelper.buildGenericFormRow(FIELD_CONFIG, currentChart, chartRow);

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", function () {
      formContentDiv.removeChild(chartRow);
    });
    chartRow.appendChild(removeButton);

    formContentDiv.appendChild(chartRow);
  },
};

const clickWeatherTableCRUD = {
  createWeatherTableStealthCRUD: function (
    contentElement,
    clickWeatherManagerInstance
  ) {
    const chartStealthFormInstance = new stealthForm(
      contentElement,
      "Manage Tables",
      "Sortable Tables",
      this.updateTableFormList.bind(this),
      clickWeatherManagerInstance
    );

    chartStealthFormInstance.addCustomButton(
      "Submit",
      this.stealthFormSubmitChartCallback.bind(this)
    );
    chartStealthFormInstance.addCustomButton(
      "Cancel",
      this.stealthFormCancelChartCallback.bind(this)
    );
    chartStealthFormInstance.addCustomButton(
      "Add Chart",
      this.stealthFormAddChartCallback.bind(this)
    );
  },

  stealthFormAddChartCallback: function (stealthFormInstance) {
    console.log("Add Chart Click");
    console.log(stealthFormInstance);

    // Get the div element where the form content is going to reside
    const formContentDiv = document.getElementById(
      stealthFormInstance.getStealthFormContentId()
    );

    this.tableFormPrintTableRow(formContentDiv);
  },

  stealthFormCancelChartCallback: function (stealthFormInstance) {
    console.log("Cancelled");
    stealthFormInstance.hideForm();
  },

  parseChartRows: function (stealthFormInstance) {
    const formContentDiv = document.getElementById(
      stealthFormInstance.getStealthFormContentId()
    );

    const rows = Array.from(formContentDiv.children).slice(1); // Skip the header row
    const chartData = rows.map((row) => {
      const inputs = row.querySelectorAll("input, select");

      // console.log(inputs);

      // Parse the string for the table metadata in the hidden element
      const tempTableArray = [];
      if (inputs[6].value.trim()) {
        inputs[6].value
          .split(",")
          .map((tableItem) =>
            tempTableArray.push({ hours: parseInt(tableItem) })
          );
      }

      // console.log(tempTableArray);

      var tempOffsetType = false;
      if (parseInt(inputs[2].value) === 1) {
        tempOffsetType = true;
      }
      // Parse individual inputs and dropdowns
      return {
        title: inputs[0]?.value || "", // Chart Subtitle
        // title: row.children[0].textContent.trim(), // Non-editable title
        // shortTitle: inputs[0]?.value || "", // Chart Subtitle
        days: parseInt(inputs[1]?.value, 10) || 5, // Days
        offset: parseInt(inputs[2]?.value, 10) === 1, // Offset Type drop down
        chartType: parseInt(inputs[3].value, 10) || 0, // Chart Type (select)
        radiusMiles: parseFloat(inputs[4]?.value) || 5, // Radius Miles
        radiusStations: parseInt(inputs[5]?.value, 10) || 20, // Radius Stations
        tables: tempTableArray,
      };
    });

    return chartData;
  },

  stealthFormSubmitChartCallback: function (stealthFormInstance) {
    console.log("Submitted");

    // Clear the chart list
    myClickWeatherManager.setDefinedCharts([]);

    // Push all the charts we have in the list into the weather manager's chart list
    this.parseChartRows(stealthFormInstance).forEach((attributes) => {
      myClickWeatherManager.pushAttributesToDefinedCharts(attributes);
    });

    // If the user has submitted the form, this is now a custom chart
    myClickWeatherManager.setChartMode(CHART_MODES.custom);

    stealthFormInstance.hideForm();

    const positionAttributes = myClickWeatherManager.getPositionAttributes();

    // Need to figure out how to handle stations
    clickWeatherClickListener(
      {
        lat: positionAttributes.position.lat,
        lng: positionAttributes.position.lon,
      },
      false,
      []
    );
  },

  // Main function
  updateTableFormList: function (stealthFormInstance) {
    // Get the div element where the form content is going to reside
    const formContentDiv = document.getElementById(
      stealthFormInstance.getStealthFormContentId()
    );

    let isFirstRow = true;

    myClickWeatherManager.getDefinedCharts().forEach((currentChart) => {
      this.tableFormPrintTableRow(formContentDiv, currentChart, isFirstRow);
      isFirstRow = false; // After the first row, no need for headers
    });
  },

  tableFormPrintTableRow: function (
    formContentDiv,
    currentChart = {},
    isFirstRow = false
  ) {
    // Create a wrapper div for the chart row
    const chartRow = document.createElement("div");
    chartRow.style.display = "flex";
    chartRow.style.gap = "10px";
    chartRow.style.alignItems = "center";
    chartRow.style.marginBottom = "10px";

    const FIELD_CONFIG = [
      {
        type: "text",
        label: "Full Chart Title",
        width: "350px",
        key: "fullTitle",
        readOnly: true,
        placeholder: "New Chart",
        defaultValue: "New Chart",
      },
      {
        type: "input",
        label: "Chart Subtitle",
        width: "150px",
        key: "title",
        placeholder: "Title",
      },
      {
        type: "number",
        label: "Days",
        width: "60px",
        key: "days",
        placeholder: "Days",
      },

      {
        type: "select",
        label: "Offset Type",
        width: "180px",
        key: "offset",
        options: Object.entries(DATA_TYPES_READABLE).map(([key, label]) => ({
          value: key,
          label,
        })),
      },
      {
        type: "select",
        label: "Chart Type",
        width: "190px",
        key: "dataType",
        options: Object.entries(CHART_TYPE_READABLE).map(([key, label]) => ({
          value: key,
          label,
        })),
      },
      {
        type: "number",
        label: "Radius Miles",
        width: "60px",
        key: "radiusMiles",
        placeholder: "Miles",
      },
      {
        type: "number",
        label: "Radius Stations",
        width: "60px",
        key: "radiusStations",
        placeholder: "Num Stations",
      },
      {
        type: "hidden",
        label: "Chart Tables",
        key: "tables",
        transform: (tables) =>
          tables?.map((table) => table.hours).join(",") || "",
      },
      {
        type: "actions",
        label: "Actions",
        width: "auto",
      },
    ];

    if (isFirstRow) {
      // Create a header row with labels
      const headerRow = document.createElement("div");
      headerRow.style.display = "flex";
      headerRow.style.gap = "10px";
      headerRow.style.alignItems = "center";
      headerRow.style.fontWeight = "bold";
      headerRow.style.marginBottom = "10px";

      FIELD_CONFIG.forEach(({ label, width, type }) => {
        if (type != "hidden") {
          const labelDiv = document.createElement("div");
          labelDiv.textContent = label;
          labelDiv.style.width = width;
          labelDiv.style.textAlign = "center"; // Align text with inputs
          headerRow.appendChild(labelDiv);
        }
      });

      // Append the header row to the form
      formContentDiv.appendChild(headerRow);
    } // END if (isFirstRow)

    myCRUDHelper.buildGenericFormRow(FIELD_CONFIG, currentChart, chartRow);

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", function () {
      formContentDiv.removeChild(chartRow);
    });
    chartRow.appendChild(removeButton);

    formContentDiv.appendChild(chartRow);
  },
};
