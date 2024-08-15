// Inserts the needed number of tab elements inside a parent tab container
function createTabElements(parentContainer, numTabs) {
  // Get the parent container
  const parentElement = document.getElementById(parentContainer);

  // Inside the parent container, create a div for the tab headings
  var tabLabelDiv = document.createElement("div");
  tabLabelDiv.setAttribute("class", "tabs");

  // Inside the parent container, create a div for the tab content
  var tabContentDiv = document.createElement("div");
  tabContentDiv.setAttribute("class", "tab-content");

  for (var tabIndex = 0; tabIndex < numTabs; tabIndex++) {
    var classActive = "";
    // For the first tab, update the class type to be active
    if (tabIndex == 0) {
      classActive = " active";
    }

    // Configure and append the buttons
    var tabButtonElement = document.createElement("button");
    tabButtonElement.setAttribute("class", "tab" + classActive);
    tabButtonElement.setAttribute("id", "tabButton" + tabIndex);
    tabButtonElement.setAttribute(
      "onClick",
      "openTab(event, 'tab" + tabIndex + "')"
    );
    tabLabelDiv.appendChild(tabButtonElement);

    // Configure and append the content
    var tabContentElement = document.createElement("div");
    tabContentElement.setAttribute("class", "tab-pane" + classActive);
    tabContentElement.setAttribute("id", "tab" + tabIndex);

    var tabImage = document.createElement("img");
    tabImage.setAttribute("id", "img" + tabIndex);

    tabContentElement.appendChild(tabImage);
    tabContentDiv.appendChild(tabContentElement);

    console.log(tabIndex);
  }

  console.log(tabLabelDiv);
  console.log(parentContainer);
  console.log(parentElement);

  parentElement.appendChild(tabLabelDiv);
  parentElement.appendChild(tabContentDiv);
}

function openTab(event, tabId) {
  const tabPanes = document.querySelectorAll(".tab-pane");
  const tabs = document.querySelectorAll(".tab");

  tabPanes.forEach((pane) => pane.classList.remove("active"));
  tabs.forEach((tab) => tab.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  event.currentTarget.classList.add("active");
}

function setTabProperties(tabIndex, newText, newImageUrl, newAltText = "") {
  // Set the button text
  const tabButton = document.getElementById(`tabButton${tabIndex}`);
  if (tabButton) {
    tabButton.textContent = newText;
  } else {
    console.error(`Tab button with index ${tabIndex} does not exist.`);
  }

  const imgElement = document.getElementById(`img${tabIndex}`);
  if (imgElement) {
    imgElement.src = newImageUrl;
    imgElement.alt = newAltText || imgElement.alt; // If newAltText is not provided, keep the existing alt text
  } else {
    console.error(`Image element with index ${tabIndex} does not exist.`);
  }
}
