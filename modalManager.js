class ModalManager {
    constructor(modalWidth = "70%", modalContentDivId = "modalContentDiv") {
        this.onHide = null;
        this.isShowing = false;

        this.isMouseDownInside = false;
        this.createModal(modalWidth, modalContentDivId);
    }

    // Function to create the modal
    createModal(modalWidth, contentDivId) {

        const modalName = "windowModal";

        var windowModalDiv = document.createElement("div");
        windowModalDiv.setAttribute("id", modalName);
        windowModalDiv.setAttribute("class", "modal");
        this.windowModalDiv = windowModalDiv;

        var modalContent = document.createElement("div");
        modalContent.setAttribute("class", "modal-content");
        modalContent.style.width = modalWidth;


        var closeBtn = document.createElement("span");
        closeBtn.setAttribute("id", "closeReportBtn");
        closeBtn.setAttribute("class", "close");
        closeBtn.innerHTML = "&times;";
        modalContent.appendChild(closeBtn);

        var contentDiv = document.createElement("div");
        contentDiv.setAttribute("id", contentDivId);
        modalContent.appendChild(contentDiv);
        this.contentDiv = contentDiv;
        windowModalDiv.appendChild(modalContent);

        // Append to the body
        document.body.appendChild(windowModalDiv);

        // Close modal
        closeBtn.onclick = () => {
            this.hideModal();
            // windowModalDiv.style.display = "none";
        };




        // Track click start
        window.addEventListener("mousedown", (e) => {
            this.isMouseDownInside = this.contentDiv.contains(e.target);
        });

        window.addEventListener("mouseup", (e) => {
            this.isMouseDownInside = false; // user released inside modal
        });


        // Listen on the overlay or document
        window.addEventListener("click", (e) => {
            console.log("Fired the modal window listener");
            // Only windowk started AND ended outside modal
            if (!this.isMouseDownInside && !this.contentDiv.contains(e.target) && this.isShowing) {
                console.log("Hide the modal");
                this.hideModal();
            }
        });





        /*
        // Close modal when clicking outside content
        window.onclick = (event) => {

            if (event.target === this.windowModalDiv) {
                this.hideModal();
                // windowModalDiv.style.display = "none";
            }
        };
        */

    }

    setOnHideCallback(onHide) {
        this.onHide = onHide;
    }

    hideModal() {
        this.windowModalDiv.style.display = "none";
        // In the future, maybe we add a callback that is added in the constructor if needed

        this.isShowing = false;

        if (typeof this.onHide === "function") {
            this.onHide(); // call the callback
        }
    }

    showModal() {
        this.windowModalDiv.style.display = "block";
        this.isShowing = true;
        // In the future, maybe we add a callback that is added in the constructor if needed

    }

    getContentDiv() {
        return this.contentDiv;
    }
}


// Create modal containing a map and a menu to the side in the modalContentDiv
class ModalMapMenu {
    constructor(modalContentDiv) {

        // Build the divs
        this.modalParentDiv = modalContentDiv;
        this.initModalMap();


    }

    initModalMap() {
        modalContentDiv.innerHTML = ""; // Clear previous content

        // Container that will hold map + sidebar
        const container = document.createElement("div");
        container.id = "modal-container";
        modalContentDiv.appendChild(container);

        // Map div
        const mapDiv = document.createElement("div");
        mapDiv.id = "modal-map";
        container.appendChild(mapDiv);

        // Sidebar div
        const sidebarDiv = document.createElement("div");
        sidebarDiv.id = "modal-sidebar";
        // sidebarDiv.innerHTML = "<h2>Coverage Polygons</h2>";
        container.appendChild(sidebarDiv);
        this.sidebarDiv = sidebarDiv;

        // Create the map object
        const modalMapManager = new MapManager(mapDiv.id, { lat: 40.7128, lng: -74.006 }, 12);
        this.modalMapManager = modalMapManager;


    }

    getSidebar() {
        return this.sidebarDiv;
    }

    getMap() {
        return this.modalMapManager
    }
}
