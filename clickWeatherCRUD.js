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

      // Parse the string for the table metadata in the hidden element
      const tempTableArray = [];
      if (inputs[7].value.trim()) {
        inputs[7].value
          .split(",")
          .map((tableItem) =>
            tempTableArray.push({ hours: parseInt(tableItem) })
          );
      }

      console.log(tempTableArray);

      // Parse individual inputs and dropdowns
      return {
        title: inputs[0]?.value || "", // Chart Subtitle
        // title: row.children[0].textContent.trim(), // Non-editable title
        // shortTitle: inputs[0]?.value || "", // Chart Subtitle
        days: parseInt(inputs[1]?.value, 10) || 5, // Days
        offset: inputs[2]?.checked ? false : true, // Offset Type (radio buttons)
        chartType: parseInt(inputs[4].value, 10) || 0, // Chart Type (select)
        radiusMiles: parseFloat(inputs[5]?.value) || 5, // Radius Miles
        radiusStations: parseInt(inputs[6]?.value, 10) || 20, // Radius Stations
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
      clickWeatherChartCRUD.chartFormPrintChartRow(
        formContentDiv,
        currentChart,
        isFirstRow
      );
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

    if (isFirstRow) {
      // Create a header row with labels
      const headerRow = document.createElement("div");
      headerRow.style.display = "flex";
      headerRow.style.gap = "10px";
      headerRow.style.alignItems = "center";
      headerRow.style.fontWeight = "bold";
      headerRow.style.marginBottom = "10px";

      // Add labels to the header row with consistent widths
      const headers = [
        { label: "Full Chart Title", width: "350px" },
        { label: "Chart Subtitle", width: "150px" },
        { label: "Days", width: "60px" },
        { label: "Offset Type", width: "180px" },
        { label: "Chart Type", width: "190px" },
        { label: "Radius Miles", width: "60px" },
        { label: "Radius Stations", width: "60px" },
        { label: "Actions", width: "auto" },
      ];

      headers.forEach(({ label, width }) => {
        const labelDiv = document.createElement("div");
        labelDiv.textContent = label;
        labelDiv.style.width = width;
        labelDiv.style.textAlign = "center"; // Align text with inputs
        headerRow.appendChild(labelDiv);
      });

      // Append the header row to the form
      formContentDiv.appendChild(headerRow);
    }

    // Chart title (non-editable)
    const titleDiv = document.createElement("div");
    titleDiv.textContent = currentChart.fullTitle || "New Chart"; // Default value for new rows
    titleDiv.style.width = "350px";
    titleDiv.style.textAlign = "center"; // Align text
    chartRow.appendChild(titleDiv);

    // Chart Subtitle (input)
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.placeholder = "Title";
    titleInput.style.width = "150px";
    titleInput.value = currentChart.title || ""; // Default value
    chartRow.appendChild(titleInput);

    // Days input
    const daysInput = document.createElement("input");
    daysInput.type = "number";
    daysInput.placeholder = "Days";
    daysInput.style.width = "60px";
    daysInput.value = currentChart.days || ""; // Default value
    chartRow.appendChild(daysInput);

    // Offset radio buttons
    const offsetWrapper = document.createElement("div");
    offsetWrapper.style.display = "flex";
    offsetWrapper.style.gap = "5px";
    offsetWrapper.style.width = "190px";

    const absoluteValueRadio = document.createElement("input");
    absoluteValueRadio.type = "radio";
    absoluteValueRadio.name = `offset-${formContentDiv.children.length}`;
    absoluteValueRadio.value = "false";
    absoluteValueRadio.checked =
      currentChart.offset === false || !currentChart.offset;
    offsetWrapper.appendChild(absoluteValueRadio);
    offsetWrapper.appendChild(document.createTextNode("Absolute"));

    const changeInValueRadio = document.createElement("input");
    changeInValueRadio.type = "radio";
    changeInValueRadio.name = `offset-${formContentDiv.children.length}`;
    changeInValueRadio.value = "true";
    changeInValueRadio.checked = currentChart.offset === true;
    offsetWrapper.appendChild(changeInValueRadio);
    offsetWrapper.appendChild(document.createTextNode("Change"));

    chartRow.appendChild(offsetWrapper);

    // Chart Type dropdown
    const chartTypeSelect = document.createElement("select");
    chartTypeSelect.style.width = "150px"; // Match width to header

    let hasSelectedOption = false;

    Object.entries(CHART_TYPE_READABLE).forEach(([key, label]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = label;

      // If we don't have a data type for the object,
      // and we haven't set a default yet, set the first one to default
      /*
    if (!currentChart.dataType && !hasSelectedOption) {
      console.log("Another way to try and set this to not be null");
      option.selected = true;
      hasSelectedOption = true;
    }
      */

      // Otherwise, update the flag as we find the key
      if (parseInt(key) === currentChart.dataType) {
        option.selected = true; // Default value
        hasSelectedOption = true;
      }

      console.log(option);
      chartTypeSelect.appendChild(option);
    });

    /*  // If no matching dataType found, select the first option
  if (!hasSelectedOption) {
    chartTypeSelect.options[0].selected = true;
  }
    */

    /*
  if (!hasSelectedOption) {
    console.log("Setting unselected index 1");
    chartTypeSelect.selectedIndex = 0; // Explicitly set the first option as selected
  }
    */

    chartRow.appendChild(chartTypeSelect);

    // Radius Miles input
    const radiusMilesInput = document.createElement("input");
    radiusMilesInput.type = "number";
    radiusMilesInput.placeholder = "Miles";
    radiusMilesInput.style.width = "60px";
    radiusMilesInput.value = currentChart.radiusMiles || ""; // Default value
    chartRow.appendChild(radiusMilesInput);

    // Radius Stations input
    const radiusStationsInput = document.createElement("input");
    radiusStationsInput.type = "number";
    radiusStationsInput.placeholder = "Num Stations";
    radiusStationsInput.style.width = "60px";
    radiusStationsInput.value = currentChart.radiusStations || ""; // Default value
    chartRow.appendChild(radiusStationsInput);

    const hiddenTableInfoInput = document.createElement("input");
    hiddenTableInfoInput.type = "hidden"; // Hidden input
    hiddenTableInfoInput.name = "chartTables"; // The name used for form parsing
    const tablesString = currentChart.tables
      .map((currentTable) => currentTable.hours)
      .join(",");
    hiddenTableInfoInput.value = tablesString;
    chartRow.appendChild(hiddenTableInfoInput);

    // Remove button
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", function () {
      formContentDiv.removeChild(chartRow);
    });
    chartRow.appendChild(removeButton);

    // Append the row to the list
    formContentDiv.appendChild(chartRow);
  },
};

const clickWeatherTableCRUD = {
  tableFormPrintRow: (
    formContentDiv,
    currentChart = {},
    isFirstRow = false
  ) => {
    // Create a wrapper div for the chart row
    const chartRow = document.createElement("div");
    chartRow.style.display = "flex";
    chartRow.style.gap = "10px";
    chartRow.style.alignItems = "center";
    chartRow.style.marginBottom = "10px";

    if (isFirstRow) {
      // Create a header row with labels
      const headerRow = document.createElement("div");
      headerRow.style.display = "flex";
      headerRow.style.gap = "10px";
      headerRow.style.alignItems = "center";
      headerRow.style.fontWeight = "bold";
      headerRow.style.marginBottom = "10px";

      // Add labels to the header row with consistent widths
      const headers = [
        { label: "Parent Chart", width: "350px" },
        { label: "Data Type", width: "180px" },
        { label: "Hours", width: "60px" },
        { label: "Table Title", width: "180px" },
      ];

      headers.forEach(({ label, width }) => {
        const labelDiv = document.createElement("div");
        labelDiv.textContent = label;
        labelDiv.style.width = width;
        labelDiv.style.textAlign = "center"; // Align text with inputs
        headerRow.appendChild(labelDiv);
      });

      // Append the header row to the form
      formContentDiv.appendChild(headerRow);
    }

    currentChart.tables.forEach((currentTable) => {
      // Chart Type dropdown
      const chartTypeSelect = document.createElement("select");
      chartTypeSelect.style.width = "350px"; // Match width to header

      let hasSelectedOption = false;

      myClickWeatherManager.getDefinedCharts.forEach((definedChart, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = definedChart.fullTitle;

        // Otherwise, update the flag as we find the key
        if (definedChart.fullTitle === currentChart.fullTitle) {
          option.selected = true; // Default value
          hasSelectedOption = true;
        }

        console.log(option);
        chartTypeSelect.appendChild(option);
      });
      chartRow.appendChild(chartTypeSelect);

      // Append the row to the list
      formContentDiv.appendChild(chartRow);

      return 0;
    });

    // Chart title (non-editable)
    const titleDiv = document.createElement("div");
    titleDiv.textContent = currentChart.fullTitle || "New Chart"; // Default value for new rows
    titleDiv.style.width = "350px";
    titleDiv.style.textAlign = "center"; // Align text
    chartRow.appendChild(titleDiv);

    // Chart Subtitle (input)
    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.placeholder = "Title";
    titleInput.style.width = "150px";
    titleInput.value = currentChart.title || ""; // Default value
    chartRow.appendChild(titleInput);

    // Days input
    const daysInput = document.createElement("input");
    daysInput.type = "number";
    daysInput.placeholder = "Days";
    daysInput.style.width = "60px";
    daysInput.value = currentChart.days || ""; // Default value
    chartRow.appendChild(daysInput);

    // Offset radio buttons
    const offsetWrapper = document.createElement("div");
    offsetWrapper.style.display = "flex";
    offsetWrapper.style.gap = "5px";
    offsetWrapper.style.width = "190px";

    const absoluteValueRadio = document.createElement("input");
    absoluteValueRadio.type = "radio";
    absoluteValueRadio.name = `offset-${formContentDiv.children.length}`;
    absoluteValueRadio.value = "false";
    absoluteValueRadio.checked =
      currentChart.offset === false || !currentChart.offset;
    offsetWrapper.appendChild(absoluteValueRadio);
    offsetWrapper.appendChild(document.createTextNode("Absolute"));

    const changeInValueRadio = document.createElement("input");
    changeInValueRadio.type = "radio";
    changeInValueRadio.name = `offset-${formContentDiv.children.length}`;
    changeInValueRadio.value = "true";
    changeInValueRadio.checked = currentChart.offset === true;
    offsetWrapper.appendChild(changeInValueRadio);
    offsetWrapper.appendChild(document.createTextNode("Change"));

    chartRow.appendChild(offsetWrapper);

    /*  // If no matching dataType found, select the first option
  if (!hasSelectedOption) {
    chartTypeSelect.options[0].selected = true;
  }
    */

    /*
  if (!hasSelectedOption) {
    console.log("Setting unselected index 1");
    chartTypeSelect.selectedIndex = 0; // Explicitly set the first option as selected
  }
    */

    // Radius Miles input
    const radiusMilesInput = document.createElement("input");
    radiusMilesInput.type = "number";
    radiusMilesInput.placeholder = "Miles";
    radiusMilesInput.style.width = "60px";
    radiusMilesInput.value = currentChart.radiusMiles || ""; // Default value
    chartRow.appendChild(radiusMilesInput);

    // Radius Stations input
    const radiusStationsInput = document.createElement("input");
    radiusStationsInput.type = "number";
    radiusStationsInput.placeholder = "Num Stations";
    radiusStationsInput.style.width = "60px";
    radiusStationsInput.value = currentChart.radiusStations || ""; // Default value
    chartRow.appendChild(radiusStationsInput);

    // Remove button
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", function () {
      formContentDiv.removeChild(chartRow);
    });
    chartRow.appendChild(removeButton);
  },
};
