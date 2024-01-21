document.addEventListener('DOMContentLoaded', function () {
    var webcamStream;

    // Add event listener for the "Start Webcam" button
    document.getElementById('startWebcam').addEventListener('click', function () {
        startWebcam();
    });

    // Add event listener for the "Stop Webcam" button
    document.getElementById('stopWebcam').addEventListener('click', function () {
        stopWebcam();
    });

    // Add event listener for the "Capture" button
    document.getElementById('captureButton').addEventListener('click', function () {
        captureAndDisplay();
    });

    // Add event listener for the "Reset" button
    document.getElementById('resetButton').addEventListener('click', function () {
        resetApp();
    });
});

function startWebcam() {
    // Check for webcam support
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                // Set the video source to the webcam stream
                var video = document.getElementById('webcam');
                video.srcObject = stream;
                video.play();

                // Show the video element and related buttons
                video.style.display = 'block';
                document.getElementById('stopWebcam').style.display = 'inline-block';
                document.getElementById('captureButton').style.display = 'inline-block';
                document.getElementById('startWebcam').style.display = 'none';

                // Invert the webcam horizontally
                video.style.transform = 'scaleX(-1)';

                // Initialize canvas for capturing frames
                var canvas = document.getElementById('canvas');
                var context = canvas.getContext('2d');

                // Save the webcam stream for later use
                webcamStream = stream;

                // Call the captureFrame function every 500 milliseconds
                setInterval(function () {
                    captureFrame(video, context);
                }, 500);
            })
            .catch(function (error) {
                console.error('Error accessing webcam:', error);
            });
    } else {
        console.error('Webcam not supported');
    }
}

function captureFrame(video, context) {
    // Capture a frame from the webcam
    context.drawImage(video, 0, 0, 640, 480);

    // Convert the canvas image to base64 data URL
    var imageData = canvas.toDataURL('image/png');

    // Send the captured frame to the server
    $.ajax({
        type: 'POST',
        url: 'capture_and_display.php',
        data: { image: imageData },
        success: function (response) {
            // Handle the server response
            console.log(response);

            // Display color names on the page
            displayColorNames(response);
        },
        error: function (error) {
            console.error('Error sending frame to server:', error);
        }
    });
}

function stopWebcam() {
    // Stop the webcam stream
    if (webcamStream) {
        var tracks = webcamStream.getTracks();
        tracks.forEach(function (track) {
            track.stop();
        });

        // Clear the video source
        var video = document.getElementById('webcam');
        video.srcObject = null;

        // Hide the video element and related buttons
        video.style.display = 'none';
        document.getElementById('stopWebcam').style.display = 'none';
        document.getElementById('captureButton').style.display = 'none';
        document.getElementById('startWebcam').style.display = 'inline-block';
        // Reset the webcam transformation
        video.style.transform = 'scaleX(1)';

        // Clear the color names container
        clearColorNames();
    }
}

function clearColorNames() {
    // Clear the color names container
    var colorNamesContainer = document.getElementById('colorNames');
    colorNamesContainer.innerHTML = '';
    colorNamesContainer.style.display = 'none';

    // Hide the reset button
    var resetButton = document.getElementById('resetButton');
    resetButton.style.display = 'none';
}

function resetApp() {
    // Your reset logic goes here
    // This function is called when the "Reset" button is clicked
    // For example, you can hide the color names and show the default home page content

    clearColorNames();

    // Get the current page content (assuming you have an element with ID 'homeContent')
    var homeContent = document.getElementById('homeContent');

    // Check if you are on the default home page
    if (homeContent.style.display === 'block') {
        // Hide the reset button
        var resetButton = document.getElementById('resetButton');
        resetButton.style.display = 'none';
    }

    // Show the default home page content
    homeContent.style.display = 'block';
}

function displayColorNames(response) {
    // Update the page to display color names
    var colorNamesContainer = document.getElementById('colorNames');
    colorNamesContainer.innerHTML = '';

    response.colors.forEach(function (color) {
        var colorDiv = document.createElement('div');
        colorDiv.style.backgroundColor = color.rgb;
        colorDiv.innerHTML = color.color_name;
        colorNamesContainer.appendChild(colorDiv);
    });

    // Show the color names container
    colorNamesContainer.style.display = 'block';

    // Show the reset button
    var resetButton = document.getElementById('resetButton');
    resetButton.style.display = 'inline-block';

    // Hide the default home page content
    var homeContent = document.getElementById('homeContent');
    homeContent.style.display = 'none';
}

function captureAndDisplay() {
    // Capture a frame and display color names
    captureFrame(document.getElementById('webcam'), document.getElementById('canvas').getContext('2d'));
}
