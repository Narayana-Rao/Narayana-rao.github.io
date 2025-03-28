function copyCitation(format, button) {
  // Get the citation text based on format
  var citationText = document.getElementById(format).value;

  // Trim leading and trailing spaces from the entire text
  citationText = citationText.trim();

  // Split the citation into individual lines
  var lines = citationText.split('\n').map(function(line) {
      return line.trimStart();  // Trim leading spaces from each line
  });

  // If the citation has more than 3 lines, add a space between extra lines
  if (lines.length > 3) {
      for (var i = 1; i < lines.length - 1; i++) {
          lines[i] = "  " + lines[i];  // Add a space to the beginning of the extra lines
      }
  }

  // Join the lines back together with newline characters
  citationText = lines.join('\n');

  // Check if the Clipboard API is available (more reliable for modern mobile devices)
  if (navigator.clipboard) {
      // Use Clipboard API for copying the citation
      navigator.clipboard.writeText(citationText).then(function() {
          // Optionally, you can alert the user that the citation has been copied
          // alert(format.charAt(0).toUpperCase() + format.slice(1).slice(0, -4) + ' citation copied!');
          
          // Change the text of the button that was clicked to "Copied!"
          if (button) {
              button.textContent = 'Copied!';  // Change text to 'Copied!'

              // Reset the button text after 2 seconds
              setTimeout(function() {
                  button.textContent = '📋 Copy ' + format.charAt(0).toUpperCase() + format.slice(1).slice(0, -4);
              }, 2000);
          } else {
              console.error('Button not found for format: ' + format);  // Handle the case where the button doesn't exist
          }
      }).catch(function(error) {
          console.error('Failed to copy: ', error);
      });
  } else {
      // Fallback for older browsers or when Clipboard API is not supported
      var tempTextArea = document.createElement('textarea');
      tempTextArea.value = citationText;
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand('copy');
      document.body.removeChild(tempTextArea);

      // Optionally, you can alert the user that the citation has been copied
      // alert(format.charAt(0).toUpperCase() + format.slice(1).slice(0, -4) + ' citation copied!');

      // Change the text of the button that was clicked to "Copied!"
      if (button) {
          button.textContent = 'Copied!';  // Change text to 'Copied!'
        
          // Reset the button text after 2 seconds
          setTimeout(function() {
              button.textContent = '📋 Copy ' + format.charAt(0).toUpperCase() + format.slice(1).slice(0, -4);
          }, 2000);
      } else {
          console.error('Button not found for format: ' + format);  // Handle the case where the button doesn't exist
      }
  }
}
