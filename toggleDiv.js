function createToggleChildElements(parentId, title) {
  const divTitle = "hide-show-" + divify(title);
  const button = document.createElement("button");
  button.textContent = "Show/Hide " + title;
  button.onclick = function () {
    toggleChildVisibility(divTitle + "-parent");
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
  dynamicDivElement.appendChild(button);
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
  // Get all div elements in the document
  const allDivs = document.querySelectorAll("div");

  console.log(allDivs);

  // Filter divs with the specific id format and get their style.display
  const matchingDivs = Array.from(allDivs)
    .filter((div) => /hide-show-.*-child/.test(div.id)) // Use div.id instead of div.getAttribute("name")
    .map((div) => ({
      element: div,
      display: div.style.display || window.getComputedStyle(div).display,
    }));

  // Log the results
  console.log(matchingDivs);
  return matchingDivs;
}
