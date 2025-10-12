# Formula Architecture: Green Screen Helper

This document details the technical architecture and workflow of the Green Screen Helper application.

## Core Components

The application is a client-side web application built with plain HTML, CSS, and JavaScript. It consists of three main files:

-   `index.html`: The main HTML structure, containing the video and canvas elements, and user controls.
-   `style.css`: Styles the application for a user-friendly layout.
-   `script.js`: Contains all the application logic for camera access, color picking, and video processing.

## Functional Workflow

The primary purpose of this tool is to help a user analyze the quality of their green screen setup by visualizing which parts of the video feed are being correctly identified as the background.

1.  **Initialization**: The user opens `index.html` in a web browser. The page loads the necessary HTML elements and the JavaScript file.

2.  **Camera Access**:
    -   The user clicks the "Start Camera" button.
    -   The `startCamera` function in `script.js` is triggered.
    -   It uses the `navigator.mediaDevices.getUserMedia({ video: true })` Web API to request access to the user's webcam.
    -   The incoming video stream is directed to an HTML `<video>` element.

3.  **Real-time Video Processing**:
    -   Once the video stream starts, the `analyzeFrame` function is called repeatedly using `requestAnimationFrame`. This creates a continuous loop to process each frame.
    -   In each loop iteration:
        a.  The current frame from the `<video>` element is drawn onto a hidden `<canvas>` element of the same size.
        b.  The `context.getImageData()` method is used to get an array (`ImageData.data`) containing the RGBA values for every pixel on the canvas.
        c.  The code iterates through this pixel array.

4.  **Color Analysis (The "Formula")**:
    -   For each pixel, a "color distance" is calculated between the pixel's RGB values and the selected `keyColor` (the green screen color).
    -   The formula for this distance is the Euclidean distance in 3D RGB space:
        `distance = sqrt((r1-r2)^2 + (g1-g2)^2 + (b1-b2)^2)`
    -   This `distance` is compared against a `tolerance` value, which is adjustable by the user via a slider.

5.  **Visualization**:
    -   **If `distance > tolerance`**: The pixel's color is considered different from the background color. To make this visible, the script changes the pixel's color to a bright magenta (`#FF00FF`). This highlights foreground objects or imperfections in the green screen.
    -   **If `distance <= tolerance`**: The pixel's color is considered part of the background. The script makes this pixel transparent by setting its alpha channel value to `0`.

6.  **Canvas Update**:
    -   After iterating through all pixels, the modified `ImageData` is drawn back onto the canvas using `context.putImageData()`.
    -   The result is a real-time video feed where the green screen is transparent, and everything else is highlighted in magenta.

## User Controls

-   **Start/Stop Camera**: Basic controls to turn the webcam feed on and off.
-   **Color Picker**: By clicking anywhere on the video feed (the canvas), the user can set the `keyColor`. The `pickColor` function captures the RGB values of the clicked pixel, allowing for precise selection of the background color to account for variations in lighting.
-   **Tolerance Slider**: Allows the user to increase or decrease the `tolerance` value, controlling how strictly the color matching is performed. A higher tolerance will treat a wider range of green shades as the background.
