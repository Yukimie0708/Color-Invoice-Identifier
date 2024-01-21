// script.js

// Array to store spoken colors
let spokenColors = [];
// Index to keep track of the current color
let currentColorIndex = 0;

// Function to update the original image when a new image is selected
function updateOriginalImage() {
    const fileInput = document.getElementById('imageInput');
    const originalImage = document.getElementById('originalImage');
    const resetButton = document.getElementById('resetButton');
    const recognizeButton = document.querySelector('#uploadForm button');

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        originalImage.src = URL.createObjectURL(file);

        // Show the "Reset" button
        resetButton.style.display = 'block';

        // Show the "Recognize Colors" button when an image is selected
        recognizeButton.style.display = 'block';
    } else {
        originalImage.src = 'placeholder-image.png';

        // Hide the "Reset" button
        resetButton.style.display = 'none';

        // Hide the "Recognize Colors" button when no image is selected
        recognizeButton.style.display = 'none';
    }
}

// Function to hide the "Recognize Colors" button and show the "Reset" button
function hideRecognizeButtonShowReset() {
    // Hide the "Recognize Colors" button
    const recognizeButton = document.querySelector('#uploadForm button');
    recognizeButton.style.display = 'none';

    // Show the "Reset" button
    const resetButton = document.getElementById('resetButton');
    resetButton.style.display = 'block';
}

// Function to show the "Recognize Colors" and "Reset" buttons
function showRecognizeAndResetButtons() {
    // Show the "Recognize Colors" button
    const recognizeButton = document.querySelector('#uploadForm button');
    recognizeButton.style.display = 'block';

    // Show the "Reset" button
    const resetButton = document.getElementById('resetButton');
    resetButton.style.display = 'block';
}

// Function to process the selected image
function processImage() {
    const fileInput = document.getElementById('imageInput');
    const file = fileInput.files[0];

    if (file) {
        const formData = new FormData();
        formData.append('image', file);

        const originalImageContainer = document.getElementById('originalImageContainer');
        const originalImage = document.getElementById('originalImage');
        originalImageContainer.style.display = 'block';
        originalImage.src = URL.createObjectURL(file);

        fetch('process_image.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Display and speak colors
            displayColors(data.colors);
            speakColors(data.colors);

            // Call the function to hide the "Recognize Colors" button and show the "Reset" button
            hideRecognizeButtonShowReset();
        })
        .catch(error => {
            console.error('Error processing image:', error);
        });
    }
}

// Function to display dominant colors on the webpage
function displayColors(colors) {
    const colorDisplay = document.getElementById('colorDisplay');
    colorDisplay.innerHTML = '<h2>Dominant Colors</h2>';

    const colorsContainer = document.createElement('div');
    colorsContainer.style.display = 'flex';

    colors.forEach(color => {
        const colorBox = document.createElement('div');
        colorBox.className = 'colorBox';
        colorBox.style.backgroundColor = color.rgb;
        colorBox.textContent = `RGB(${color.red}, ${color.green}, ${color.blue}) - ${color.color_name}`;
        colorsContainer.appendChild(colorBox);
    });

    colorDisplay.appendChild(colorsContainer);

    // Show the "Cancel" button for speech synthesis
    document.getElementById('cancelSpeechButton').style.display = 'block';
}

// Function to speak colors
function speakColors(colors) {
    const speechSynthesis = window.speechSynthesis;
    spokenColors = [];
    currentColorIndex = 0;

    colors.forEach(color => {
        const utterance = new SpeechSynthesisUtterance(`This color is ${color.color_name} with RGB values ${color.red}, ${color.green}, ${color.blue}`);
        // SPEED
        utterance.rate = 1.3;

        spokenColors.push(utterance);
        speechSynthesis.speak(utterance);
    });
}

// Function to cancel speech synthesis
function cancelSpeech() {
    const speechSynthesis = window.speechSynthesis;
    speechSynthesis.cancel();

    // Hide the "Cancel" button
    document.getElementById('cancelSpeechButton').style.display = 'none';
    // Show the "repeat" button
    document.getElementById('repeatSpeechButton').style.display = 'block';
}

// Function to repeat the speech
function repeatSpeech() {
    const speechSynthesis = window.speechSynthesis;

    // Check if there are spoken colors
    if (spokenColors.length > 0) {
        // Show the "Cancel" button for speech synthesis
        document.getElementById('cancelSpeechButton').style.display = 'block';

        // Repeat all colors starting from the first
        for (let i = 0; i < spokenColors.length; i++) {
            speechSynthesis.speak(spokenColors[i]);
        }
    }
    // hide the "repeat" button
    document.getElementById('repeatSpeechButton').style.display = 'none';
}

// Function to reset the application
function resetApp() {
    // Cancel speech synthesis
    cancelSpeech();

    // Call the function to reset the image
    resetImage();

    // Check if you are on the default page (adjust 'homeContent' if it's different)
    const isOnDefaultPage = document.getElementById('homeContent').style.display === 'block';

    // Hide the "Reset" button if on the default page
    if (isOnDefaultPage) {
        document.getElementById('resetButton').style.display = 'none';
    }
}


// Function to reset the image
function resetImage() {
    // Clear the color display
    document.getElementById('colorDisplay').innerHTML = '';

    // Reset the file input
    document.getElementById('imageInput').value = '';

    // Hide the "Cancel" button
    document.getElementById('cancelSpeechButton').style.display = 'none';

    // Hide the "Recognize Colors" button
    const recognizeButton = document.querySelector('#uploadForm button');
    recognizeButton.style.display = 'none';

    // Hide the "Reset" button
    document.getElementById('resetButton').style.display = 'none';

    // Clear the original image
    document.getElementById('originalImage').src="bg4.jpg";
    

    // Hide the "Repeat Speech" button on reset
    document.getElementById('repeatSpeechButton').style.display = 'none';

    // Additional code to reset other parts of the image or application state
    // ...
}
// Function to check if a color is light or dark
function isLightColor(color) {
    // Create a dummy element to get the computed style
    const dummyElement = document.createElement('div');
    dummyElement.style.backgroundColor = color;
    document.body.appendChild(dummyElement);

    // Get the computed style of the dummy element
    const computedStyle = getComputedStyle(dummyElement);
    const textColor = computedStyle.color;

    // Remove the dummy element from the DOM
    document.body.removeChild(dummyElement);

    // Calculate the contrast using relative luminance
    const contrast = getContrastRatio(textColor, color);

    // Return true if the contrast is sufficient, false otherwise
    return contrast > 4.5;
}

// Function to calculate the contrast ratio
function getContrastRatio(color1, color2) {
    const lum1 = getRelativeLuminance(color1);
    const lum2 = getRelativeLuminance(color2);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
}

// Function to calculate the relative luminance
function getRelativeLuminance(color) {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    const rLinear = (rsRGB <= 0.04045) ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = (gsRGB <= 0.04045) ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = (bsRGB <= 0.04045) ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}
