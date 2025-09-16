function toggleTableVisibility(tableId) {
  var table = document.getElementById(tableId);
  table.style.display = table.style.display === "none" ? "table" : "none";
}

function buildTableRow(dataArray, isHeader = false) {
  // If it's not the header, make it td, otherwise make it th
  let elementType = "td";
  if (isHeader) elementType = "th";

  let rowHtml = "<tr>";
  // Print out each element in the row
  dataArray.forEach((rowValue) => {
    rowHtml += `<${elementType}>${rowValue}</${elementType}>`;
  });
  rowHtml += "</tr>\n";

  return rowHtml;
}

// Initialize the table
function makeTableSortable(tableId, defaultSortColumn = 1) {
  const table = document.getElementById(tableId);
  if (!table) {
    console.error(`Table with id "${tableId}" not found.`);
    return;
  }

  // console.log("Found table " + tableId);

  const headers = table.querySelectorAll("tr th");
  // console.log(headers);

  // Set this to the opposite of what I want (ascending)
  // That way when I call the sortTable function, it'll reverse sort it
  headers[defaultSortColumn].textContent += " ↑";

  headers.forEach((header, index) => {
    // Add onclick functionality
    header.onclick = () => sortTable(tableId, index);
  });

  // Perform an initial sort on the default column (column 1)
  sortTable(tableId, defaultSortColumn);
}

function sortTable(tableId, columnIndex) {
  const table = document.getElementById(tableId);
  if (!table) {
    console.error(`Table with id "${tableId}" not found.`);
    return;
  }
  const tbody = table.tBodies[0];

  // const tbody = table.querySelector("tbody");
  const headers = tbody.querySelectorAll("tr th");
  const headerRow = Array.from(tbody.querySelectorAll("tr"))[0];
  const rows = Array.from(tbody.querySelectorAll("tr")).slice(1);

  // Find the active header for the specified column
  const currentHeader = headers[columnIndex];

  // Determine sort direction based on the arrow content
  const sortDirection = currentHeader.textContent.slice(-2) !== " ↑"; // Default to ascending if no arrow or "▼"

  // Sort rows by the specified column's cell value
  rows.sort((rowA, rowB) => {
    const cellA = rowA.children[columnIndex].textContent.trim();
    const cellB = rowB.children[columnIndex].textContent.trim();

    // Handle numeric and string sorting
    const isNumeric = !isNaN(parseFloat(cellA)) && !isNaN(parseFloat(cellB));
    if (isNumeric) {
      return sortDirection
        ? parseFloat(cellA) - parseFloat(cellB)
        : parseFloat(cellB) - parseFloat(cellA);
    } else {
      return sortDirection
        ? cellA.localeCompare(cellB)
        : cellB.localeCompare(cellA);
    }
  });

  tbody.appendChild(headerRow);

  // Append sorted rows back into the table body
  rows.forEach((row) => tbody.appendChild(row));

  // Update arrows in the header
  updateHeaderArrows(headers, columnIndex, sortDirection);
}

// Update arrow indicators
function updateHeaderArrows(headers, columnIndex, sortDirection) {
  headers.forEach((header, index) => {
    // Remove any existing arrows from textContent
    let text = header.textContent.trim(); // Get the clean text without arrows

    // Remove any existing arrows by checking if they are in the text
    text = text.replace(" ↑", "").replace(" ↓", "");

    // Append the new arrow based on the direction
    if (index == columnIndex) {
      if (sortDirection) {
        text += " ↑"; // Add up arrow for ascending
      } else {
        text += " ↓"; // Add down arrow for descending
      }
    }

    // Set the new text content with the arrow
    header.textContent = text;
  });
}

class buildTableDom {
  constructor(tableId) {

    this.table = document.createElement("table");
    this.table.setAttribute("border", "1");
    this.currentRow = null;
    if (tableId) { this.table.id = tableId }

  }

  addRow() {
    this.currentRow = document.createElement("tr");
    this.table.appendChild(this.currentRow)

    return this.currentRow;
  }

  addRowItemsList(list, isHeader = false) {
    list.forEach((item) => {
      this.addRowItem(item, isHeader);
    });
  }

  addRowItem(item, isHeader) {
    const itemType = isHeader ? "th" : "td";
    const newRowItem = document.createElement(itemType);
    newRowItem.textContent = item;
    this.currentRow.appendChild(newRowItem);
    return newRowItem;
  }

  getTable() {
    return this.table;
  }

}
