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

  const headers = table.querySelectorAll("th");
  headers.forEach((header, index) => {
    // Add the arrow span if not already present
    let arrow = header.querySelector(".arrow");
    if (!arrow) {
      arrow = document.createElement("span");
      arrow.classList.add("arrow");
      header.appendChild(arrow);
    }

    // Add onclick functionality
    header.onclick = () => sortTable(table, index);
  });

  // Perform an initial sort on the default column (column 1)
  sortTable(table, defaultSortColumn);
}

// Sorting logic
function sortTable(table, columnIndex) {
  const tbody = table.tBodies[0];
  const rows = Array.from(tbody.rows);
  console.log(tbody);
  console.log(rows);

  const headers = table.querySelectorAll("th");
  const currentHeader = headers[columnIndex];
  const arrow = currentHeader.querySelector(".arrow");

  // Determine sort direction from the arrow
  const sortDirection = arrow.textContent !== "▲"; // Default to ascending if no arrow or "▼"

  // Update arrows in table headers
  updateHeaderArrows(headers, columnIndex, sortDirection);

  // Sort rows
  rows.sort((a, b) => {
    const cellA = a.cells[columnIndex].textContent.trim();
    const cellB = b.cells[columnIndex].textContent.trim();

    const isNumeric = !isNaN(cellA) && !isNaN(cellB);
    if (isNumeric) {
      return sortDirection ? cellA - cellB : cellB - cellA;
    } else {
      return sortDirection
        ? cellA.localeCompare(cellB)
        : cellB.localeCompare(cellA);
    }
  });

  // Append sorted rows back to tbody
  rows.forEach((row) => tbody.appendChild(row));
}

// Update arrow indicators
function updateHeaderArrows(headers, columnIndex, sortDirection) {
  headers.forEach((header, index) => {
    const arrow = header.querySelector(".arrow");
    if (index === columnIndex) {
      arrow.textContent = sortDirection ? "▲" : "▼";
    } else {
      arrow.textContent = ""; // Clear arrows for other columns
    }
  });
}
