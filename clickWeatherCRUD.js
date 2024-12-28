const myCRUDHelper = {
  buildGenericFormRow: function (
    fieldAttributes,
    formObject,
    parentElement,
    printRowCallback = true,
    arrayIndex = 0
  ) {
    // Create a wrapper div for the chart row
    const chartRow = document.createElement("div");
    chartRow.style.display = "flex";
    chartRow.style.gap = "10px";
    chartRow.style.alignItems = "center";
    chartRow.style.marginBottom = "10px";

    let isArrayField = false;
    let arrayFieldNumElements = 0;

    fieldAttributes.forEach((field) => {
      const {
        fieldType,
        key,
        width,
        placeholder,
        options,
        readOnly,
        transform,
        defaultValue,
      } = field;

      let fieldElement;
      switch (fieldType) {
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
          fieldElement.value = transform
            ? transform(formObject[key])
            : formObject[key] || "";
          break;

        case "number":
          fieldElement = document.createElement("input");
          fieldElement.type = "number";
          fieldElement.placeholder = placeholder || "";
          fieldElement.style.width = width;
          fieldElement.value = formObject[key] || "";
          break;

        case "number-array":
          isArrayField = true;
          arrayFieldNumElements = formObject[key]?.length;
          fieldElement = document.createElement("input");
          fieldElement.type = "number";
          fieldElement.placeholder = placeholder || "";
          fieldElement.style.width = width;
          fieldElement.value = transform
            ? transform(formObject[key])?.[arrayIndex]
            : formObject[key]?.[arrayIndex] || "";
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

        case "action-remove":
          fieldElement = document.createElement("button");
          fieldElement.textContent = "Remove";
          fieldElement.addEventListener("click", function () {
            parentElement.removeChild(chartRow);
          });
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

      if (fieldElement) chartRow.appendChild(fieldElement);
    });

    if (printRowCallback) {
      parentElement.appendChild(chartRow);
    }

    if (isArrayField && arrayIndex + 1 < arrayFieldNumElements) {
      this.buildGenericFormRow(
        fieldAttributes,
        formObject,
        parentElement,
        printRowCallback,
        arrayIndex + 1
      );
    }
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

    this.chartFormPrintChartRow(formContentDiv);
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
    const FIELD_CONFIG = [
      {
        fieldType: "text",
        label: "Full Chart Title",
        width: "350px",
        key: "fullTitle",
        readOnly: true,
        placeholder: "New Chart",
        defaultValue: "New Chart",
      },
      {
        fieldType: "input",
        label: "Chart Subtitle",
        width: "150px",
        key: "title",
        placeholder: "Title",
      },
      {
        fieldType: "number",
        label: "Days",
        width: "60px",
        key: "days",
        placeholder: "Days",
      },
      {
        fieldType: "select",
        label: "Offset Type",
        width: "180px",
        key: "offset",
        options: Object.entries(DATA_TYPES_READABLE).map(([key, label]) => ({
          value: key,
          label,
        })),
      },
      {
        fieldType: "select",
        label: "Chart Type",
        width: "190px",
        key: "dataType",
        options: Object.entries(CHART_TYPE_READABLE).map(([key, label]) => ({
          value: key,
          label,
        })),
      },
      {
        fieldType: "number",
        label: "Radius Miles",
        width: "60px",
        key: "radiusMiles",
        placeholder: "Miles",
      },
      {
        fieldType: "number",
        label: "Radius Stations",
        width: "60px",
        key: "radiusStations",
        placeholder: "Num Stations",
      },
      {
        fieldType: "hidden",
        label: "Chart Tables",
        key: "tables",
        transform: (tables) =>
          tables?.map((table) => table.hours).join(",") || "",
      },
      {
        fieldType: "action-remove",
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

      FIELD_CONFIG.forEach(({ label, width, fieldType }) => {
        if (fieldType != "hidden") {
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

    myCRUDHelper.buildGenericFormRow(
      FIELD_CONFIG,
      currentChart,
      formContentDiv
    );

    /*
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", function () {
      formContentDiv.removeChild(chartRow);
    });
    chartRow.appendChild(removeButton);

    formContentDiv.appendChild(chartRow);
    */
  },
};

const clickWeatherTableCRUD = {
  createWeatherTableStealthCRUD: function (
    contentElement,
    clickWeatherManagerInstance
  ) {
    const tableStealthFormInstance = new stealthForm(
      contentElement,
      "Manage Tables",
      "Sortable Tables",
      this.updateTableFormList.bind(this),
      clickWeatherManagerInstance
    );

    tableStealthFormInstance.addCustomButton(
      "Submit",
      this.stealthFormSubmitTableCallback.bind(this)
    );
    tableStealthFormInstance.addCustomButton(
      "Cancel",
      this.stealthFormCancelTableCallback.bind(this)
    );
    tableStealthFormInstance.addCustomButton(
      "Add Table",
      this.stealthFormAddTableCallback.bind(this)
    );
  },

  stealthFormAddTableCallback: function (stealthFormInstance) {
    console.log("Add Table Click");
    console.log(stealthFormInstance);

    // Get the div element where the form content is going to reside
    const formContentDiv = document.getElementById(
      stealthFormInstance.getStealthFormContentId()
    );

    this.tableFormPrintTableRow(formContentDiv);
  },

  stealthFormCancelTableCallback: function (stealthFormInstance) {
    console.log("Cancelled");
    stealthFormInstance.hideForm();
  },

  parseTableRows: function (stealthFormInstance) {
    const formContentDiv = document.getElementById(
      stealthFormInstance.getStealthFormContentId()
    );

    const rows = Array.from(formContentDiv.children).slice(1); // Skip the header row
    const chartData = rows.map((row) => {
      const inputs = row.querySelectorAll("input, select");

      // Parse individual inputs and dropdowns
      return {
        uuid: inputs[0].value,
        tableTime: parseInt(inputs[1].value),
      };
    });

    return chartData;
  },

  chartHasTablesCallback: function (currentChart) {
    if (currentChart.tables?.length > 0) {
      return true;
    }
    return false;
  },

  stealthFormSubmitTableCallback: function (stealthFormInstance) {
    console.log("Submitted Table List");

    // Clear the chart list
    // myClickWeatherManager.setDefinedCharts([]);

    // Push all the charts we have in the list into the weather manager's chart list
    this.parseTableRows(stealthFormInstance).forEach((attributes) => {
      console.log(attributes);
    });

    myClickWeatherManager.updateDefinedChartsTables(
      this.parseTableRows(stealthFormInstance)
    );

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
    console.log("Trying to make tables?!");
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
        fieldType: "select",
        label: "Data Source",
        width: "350px",
        key: "uuid",
        options: myClickWeatherManager
          .getDefinedCharts()
          .map((chartOptionInstance) => ({
            value: chartOptionInstance.uuid,
            label: chartOptionInstance.fullTitle,
          })),
      },
      {
        fieldType: "number-array",
        label: "Table Hours",
        width: "100px",
        placeholder: 24,
        key: "tables",
        transform: (tables) => tables?.map((table) => table.hours) || "",
      },
      {
        fieldType: "action-remove",
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

      FIELD_CONFIG.forEach(({ label, width, fieldType }) => {
        if (fieldType != "hidden") {
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

    myCRUDHelper.buildGenericFormRow(
      FIELD_CONFIG,
      currentChart,
      formContentDiv,
      this.chartHasTablesCallback(currentChart)
    );
  },
};
