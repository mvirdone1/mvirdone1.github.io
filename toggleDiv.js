function createToggleChildElements(
  parentId,
  title,
  customCallbackFunction = ""
) {
  const divTitle = "hide-show-" + divify(title);

  const headerDiv = document.createElement("div");
  headerDiv.classList.add("toggle-section-header");
  headerDiv.textContent = `Hide ${title}`;
  headerDiv.setAttribute("aria-expanded", "true");

  headerDiv.onclick = function () {
    const isExpanded = headerDiv.getAttribute("aria-expanded") === "true";
    headerDiv.setAttribute("aria-expanded", !isExpanded);
    headerDiv.textContent = isExpanded ? `Show ${title}` : `Hide ${title}`;
    toggleChildVisibility(divTitle + "-parent");

    if (customCallbackFunction) {
      // This is passing by reference, so values of dataSets
      // is being modified in here, specifically the borderColor
      customCallbackFunction();
    }
    // contentDiv.style.display = isExpanded ? "none" : "block";
  };

  // Create the parent div
  const parentDiv = document.createElement("div");
  parentDiv.id = divTitle + "-parent";
  // parentDiv.style.display = "none"; // Start hidden

  // Create the child div
  const childDiv = document.createElement("div");
  childDiv.id = divTitle + "-child";
  childDiv.classList.add("show-hide-class");

  // Append the child div to the parent div
  parentDiv.appendChild(childDiv);

  // Append the button and parent div to the content div
  const dynamicDivElement = document.getElementById(parentId);
  const divider = document.createElement("hr");
  dynamicDivElement.appendChild(divider);
  dynamicDivElement.appendChild(headerDiv);
  // dynamicDivElement.appendChild(button);
  dynamicDivElement.appendChild(parentDiv);

  return document.getElementById(divTitle + "-child");
}

function toggleChildVisibility(parentId) {
  const parentDiv = document.getElementById(parentId);
  const childDivs = parentDiv.children;

  for (let i = 0; i < childDivs.length; i++) {
    const div = childDivs[i];
    if (div.style.display === "none") {
      div.style.display = "block";
    } else {
      div.style.display = "none";
    }
  }
}

function getAllToggleChildren() {
  // Get all div elements with the class "show-hide-class"
  const allMatchingDivs = document.querySelectorAll("div.show-hide-class");

  // Map the elements to include their style.display or computed display property
  const matchingDivs = Array.from(allMatchingDivs).map((div) => ({
    element: div,
    display: div.style.display || window.getComputedStyle(div).display,
  }));

  // Log the results
  // console.log(matchingDivs);
  return matchingDivs;
}

function setAllToggleDivOnURLString(URLString) {
  const allMatchingHeadings = document.querySelectorAll(
    "div.toggle-section-header"
  );

  // Iterate over the string, and for each element that is "none" click the div to toggle it
  for (strIdx = 0; strIdx < URLString.length; strIdx++) {
    if (URLString[strIdx] === "n") {
      allMatchingHeadings[strIdx].onclick();
    }
  }
}
