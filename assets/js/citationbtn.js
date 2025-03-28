function copyCitation(format) {
    // Get the citation text based on format
    var citationText = document.getElementById(format).value;

    // Create a temporary textarea element to help copy the citation
    var tempTextArea = document.createElement('textarea');
    tempTextArea.value = citationText;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextArea);

    // Optionally, you can alert the user that the citation has been copied
    alert(format.charAt(0).toUpperCase() + format.slice(1) + ' citation copied!');

    // Now, find the correct button and change its text to "Copied!"
    var button = document.getElementById(format + 'Btn');  // Get the button based on format
    console.log("Button ID: ", format + 'Btn'); // Debugging: check the ID being used

    if (button) {
      button.textContent = 'Copied!';  // Change text to 'Copied!'

      // Reset the button text after 2 seconds
      setTimeout(function() {
        button.textContent = '📋 Copy ' + format.charAt(0).toUpperCase() + format.slice(1);
      }, 2000);
    } else {
      console.error('Button not found for format: ' + format);  // Handle the case where the button doesn't exist
    }
  }