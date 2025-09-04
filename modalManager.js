class ModalManager {
    constructor(modalWidth = "70%", modalContentDivId = "modalContentDiv") {

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

        // Close modal when clicking outside content
        window.onclick = (event) => {
            if (event.target === this.windowModalDiv) {
                this.hideModal();
                // windowModalDiv.style.display = "none";
            }
        };

    }

    hideModal() {
        this.windowModalDiv.style.display = "none";
        // In the future, maybe we add a callback that is added in the constructor if needed
    }

    showModal() {
        this.windowModalDiv.style.display = "block";
        // In the future, maybe we add a callback that is added in the constructor if needed

    }

    getContentDiv() {
        return this.contentDiv;
    }
}


class ModalMapMenu {
    constructor(modalParentDiv) {
        this.modalParentDiv = modalParentDiv;

    }
}
