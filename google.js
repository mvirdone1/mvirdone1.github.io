function onOpen() {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Bid Sheet Tools')
      .addItem('Generate Bid Sheets', 'generateBidSheets')
      .addItem('Generate Donor Thank You and Send Emails', 'generateDonorReceipts')
  
      .addToUi();
  }
  
  function createTimestampedFolder(parentFolderId) {
    try {
      // Get the parent folder
      var parentFolder = DriveApp.getFolderById(parentFolderId);
      if (!parentFolder) {
        Logger.log("Invalid parent folder ID.");
        return;
      }
  
      // Get the current date and time in YYYY-MM-DD HH:MM format (24-hour time)
      var now = new Date();
      var formattedDate = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
  
      // Create the folder with the formatted name
      var newFolder = parentFolder.createFolder(formattedDate);
  
      Logger.log("Folder created: " + newFolder.getName() + " (ID: " + newFolder.getId() + ")");
      return newFolder.getId(); // Return the new folder's ID if needed
    } catch (e) {
      Logger.log("Error creating folder: " + e.toString());
    }
  }
  
  function generateDonorReceipts(){
  
  
  
    const donorFolderParentId = "16t-Am4KE7VcPbVP6UEc3m3mCo2oWNWfb";
    const donorFolderId = createTimestampedFolder(donorFolderParentId);
  
    var integerFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
    var currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  
  
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Confirmed 2025 Silent Auction Items"); // Change "Sheet1" to the name of your sheet
    var startRow = 2; // Start data row (assuming row 1 is headers)
    var endRow = 43; // End row
    var templateDocId = "15V2GfSREILR8i2ruBOBAdkxPkh4QLr3_mU7fcNAczIU"; // Replace with the ID of your template Google Doc
    var templateDoc = DriveApp.getFileById(templateDocId);
  
    var oldDonor = ""
    var newDocId = ""
    var tableRows = [];
    var totalDonation = 0;
  
  
    // This variable is dependent on where we want the results in the existing doc
    // const tableIndex = 11; // Old single page document
    const tableIndex = 31; // New two page document
    const numColumns = 17;
    const receiptDocURLColumn = 18;
    const sendEmailColumn = 17;
    const donorNameColumn = 15;
    const donorEmailColumn = 16;
  
    // Create a copy of the document with a new name in the same folder
    // var newDocFile = templateDoc.makeCopy(newDocName, donorFolderId);
    // var newDocId = newDocFile.getId();
  
    // Get headers from columns A-J
    var headers = sheet.getRange(1, 1, 1, numColumns).getValues()[0];
  
    for (var i = startRow; i <= endRow; i++) {
      var rowValues = sheet.getRange(i, 1, 1, numColumns).getValues()[0];
      var replacements = {};
  
    
      // Build replacements dictionary, skipping empty cells
      for (var col = 0; col < headers.length; col++) {
        var header = headers[col];
        var value = rowValues[col];
        if (header && value !== "") {
          replacements[header] = value;
        }
      }
  
      // Don't skip zero donation rows, it breaks the automation for this
      // Skip rows with no "Qty" or "Qty" <= 0
      /*
      var qty = replacements["Qty"];
      if (!qty || qty <= 0) {
        // Logger.log("Skipping row " + i + ": Qty is empty or <= 0");
        continue;
      }
      */
  
      if(replacements["Donor"] != oldDonor)
      {
        // Only append the table if we're not on the first row of the table
        if(i > startRow)
        {
          var table = DocumentApp.openById(newDocId).getBody().insertTable(tableIndex, tableRows);
          //       tableRows.push(["Item", "Description", "Qty", "Value (ea)"])
          // Set the widths dependent on how much content there should be for each
          table.setColumnWidth(0, 125);
          table.setColumnWidth(1, 250);
          table.setColumnWidth(2, 55);
          table.setColumnWidth(3, 55); 
  
          const style = {};
          style[DocumentApp.Attribute.FONT_SIZE] = 10;
          table.setAttributes(style);
  
          DocumentApp.openById(newDocId).getBody().replaceText("<<totaldonationvalue>>", currencyFormatter.format(totalDonation));
  
          Logger.log("Made document for : " + oldDonor);
  
          // Update the sheet with the document link
          sheet.getRange(i - 1, receiptDocURLColumn).setValue('https://docs.google.com/document/d/' + newDocId);
  
          // https://support.google.com/docs/thread/206677079?
  
            const blob = DocumentApp.openById(newDocId).getAs('application/pdf');
            const file = DriveApp.getFolderById(donorFolderId).createFile(blob);
  
        }
  
        // reset our references
        oldDonor = replacements["Donor"];
        totalDonation = 0;
  
        tableRows = [];
        tableRows.push(["Item", "Description", "Qty", "Value (ea)"])
  
  
        // Create a copy of the document with a new name in the same folder
        var newDocFile = templateDoc.makeCopy(replacements["Donor"] + " Thank You and Donation Receipt", DriveApp.getFolderById(donorFolderId));
        newDocId = newDocFile.getId();
  
  
        var newDocBody = DocumentApp.openById(newDocId).getBody();
        
        // Replace placeholders in the new document
        Object.keys(replacements).forEach(function(key) {
        var escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex characters
        var placeholder = "<<" + escapedKey + ">>";
        newDocBody.replaceText(placeholder, replacements[key]);
        });
  
        Utilities.sleep(500); // Optional: A short delay to allow changes to persist
        // Added because it doesn't look like the changes are being applied in real time
        DocumentApp.openById(newDocId).saveAndClose();
        Utilities.sleep(500); // Optional: A short delay to allow changes to persist
  
  
      }
      
      totalDonation += (replacements["Value Per Item ($)"] * replacements["Qty"]);
  
  
      tableRows.push([
        replacements["Item Title"], replacements["Item Description"], integerFormatter.format(replacements["Qty"]), currencyFormatter.format(replacements["Value Per Item ($)"])])
    }
    
    Logger.log("Done generating documents, moving on to PDF and email");
    // Attempting to fix the issue with the PDF content just being the template
    Utilities.sleep(500); // Optional: A short delay to allow changes to persist
  
    var ui = SpreadsheetApp.getUi();
    
    var response = ui.alert(
      "Confirmation Required", 
      "Warning: Continuing this automation WILL email NU donors. Do you want to proceed?", 
      ui.ButtonSet.YES_NO
    );
  
    if (response != ui.Button.YES) {
      ui.alert("Automation canceled.");
      return 0;
    }
  
    // iterate over all the rows with documents and generate the PDF and also the 
    for (var i = startRow; i <= endRow; i++) {
      var docUrl = sheet.getRange(i, receiptDocURLColumn).getValue(); // Column R (Doc Link)
      var sendIt = sheet.getRange(i, sendEmailColumn).getValue();
      
      if (docUrl && sendIt == "Yes") {
        
        var docId = docUrl.split("/d/")[1].split("/")[0];
        DocumentApp.openById(docId).saveAndClose();
        var pdfBlob = DocumentApp.openById(docId).getAs('application/pdf');
        var pdfFile = DriveApp.getFolderById(donorFolderId).createFile(pdfBlob);
        var pdfUrl = pdfFile.getUrl();
        
        sheet.getRange(i, receiptDocURLColumn+1).setValue(pdfUrl); // Column S (PDF Link)
  
        var name = sheet.getRange(i, donorNameColumn).getValue(); // Column O (Donor Name)
        var emailList = sheet.getRange(i, donorEmailColumn).getValue(); // Column P (Emails)
  
        Logger.log("Sending Email for " + emailList);
  
  
        sendEmailWithPDF(name, emailList, pdfFile, false);
      }
    }
          
       
  
  }
  
  /**
   * Sends an email with the generated PDF attached.
   */
  function sendEmailWithPDF(name, emailList, pdfFile, testMode=true) {
    var defaultTestEmails = "webmaster@nordicunited.org";
    
    var emailsToSend = testMode ? defaultTestEmails : emailList;
    // emailsToSend = defaultTestEmails;
    if (!emailsToSend) return;
  
    var subject = "Nordic United Thank You and Donation Receipt";
    var body = "Dear " + name + ",\n\nThank you for your generous donation to the 2025 Nordic United Fundraiser. Attached is a thank you letter from our board and your receipt.\n\nBest regards,\n\nLaurie\nNordic United";
  
    if (testMode)
    {
      body += "\n\n Email Destination:" + emailList
    }
  
    MailApp.sendEmail({
      to: emailsToSend,
      subject: subject,
      body: body,
      attachments: [pdfFile]
    });
  
    Logger.log("Sent email to: " + emailsToSend);
  }
  
  function generateBidSheets() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Confirmed 2025 Silent Auction Items"); // Change "Sheet1" to the name of your sheet
    var startRow = 2; // Start data row (assuming row 1 is headers)
    var endRow = 100; // End row
    var templateDocId = "1i8BaAgk-_K2DjjwtBBF4EBIWETNfkue2U1_HxWJ13xw"; // Replace with the ID of your template Google Doc
    var templateDoc = DriveApp.getFileById(templateDocId);
  
    // Get the folder of the spreadsheet
    var folder = DriveApp.getFileById(ss.getId()).getParents().next();
    Logger.log("Spreadsheet folder: " + folder.getName());
  
    // Create a new document with the current timestamp as its name
    var now = new Date();
    var newFileName = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd-HH:mm") + " Bid Sheets";
    Logger.log("Creating destination document: " + newFileName);
    var destinationDoc = DocumentApp.create(newFileName);
    destinationDoc.getBody().setMarginTop(0.5*72);
    destinationDoc.getBody().setMarginBottom(0.5*72);
    destinationDoc.getBody().setMarginLeft(0.5*72);
    destinationDoc.getBody().setMarginRight(0.5*72);
    
  
    // Move the new document to the spreadsheet's folder
    DriveApp.getFileById(destinationDoc.getId()).moveTo(DriveApp.getFolderById(folder.getId()));
    
    // Get headers from columns A-J
    var headers = sheet.getRange(1, 1, 1, 10).getValues()[0];
  
    for (var i = startRow; i <= endRow; i++) {
      var rowValues = sheet.getRange(i, 1, 1, 10).getValues()[0];
      var replacements = {};
  
      // Build replacements dictionary, skipping empty cells
      for (var col = 0; col < headers.length; col++) {
        var header = headers[col];
        var value = rowValues[col];
        if (header && value !== "") {
          replacements[header] = value;
        }
      }
  
      // Skip rows with no "Qty" or "Qty" <= 0
      var qty = replacements["Qty"];
      if (!qty || qty <= 0) {
        // Logger.log("Skipping row " + i + ": Qty is empty or <= 0");
        continue;
      }
  
      // Duplicate the contents of the template document to create a temporary document
      var tempDoc = templateDoc.makeCopy(replacements["Item Title"] + " Temp Doc");
      var tempDocId = tempDoc.getId();
      var tempDocBody = DocumentApp.openById(tempDocId).getBody();
  
      // Replace placeholders in the temporary document
      Object.keys(replacements).forEach(function(key) {
        var escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex characters
        var placeholder = "<<" + escapedKey + ">>";
        tempDocBody.replaceText(placeholder, replacements[key]);
      });
  
      Logger.log("Processed row " + i);
  
      // Merge the temporary document into the destination document
      for (var j = 1; j <= qty; j++) {
        Logger.log("Merging item " + j + " into destination document");
        mergeDocs(tempDocId, destinationDoc.getId());
      }
  
      // Delete the temporary file
      DriveApp.getFileById(tempDocId).setTrashed(true);
    }
  }
  
  // https://stackoverflow.com/questions/10692669/how-can-i-generate-a-multipage-text-document-from-a-single-page-template-in-goog
  // Slightly modified to only do a single merge, not a list
  function mergeDocs(sourceId, destId) {
    Logger.log("Merging Docs")
    var baseDoc = DocumentApp.openById(destId);
  
    var body = baseDoc.getActiveSection();
  
    var otherBody = DocumentApp.openById(sourceId).getActiveSection();
  
    var totalElements = otherBody.getNumChildren();
    for( var j = 0; j < totalElements; ++j ) {
      var element = otherBody.getChild(j).copy();
      var type = element.getType();
      if( type == DocumentApp.ElementType.PARAGRAPH )
        body.appendParagraph(element);
      else if( type == DocumentApp.ElementType.TABLE )
        body.appendTable(element);
      else if( type == DocumentApp.ElementType.LIST_ITEM )
        body.appendListItem(element);
      else
        throw new Error("According to the doc this type couldn't appear in the body: "+type);
    }
  
    // Append a page break for each document merge
    // body.appendParagraph("\f"); // Page break
    // baseDoc.appendPageBreak();
  }
  