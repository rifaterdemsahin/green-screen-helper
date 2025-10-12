# Formula and Logic Explanation

This document explains the formula used in the Green Screen Helper to identify imperfections and why the screen might appear mostly green when the tolerance is set to a high value.

## Color as a Vector

Every color on a computer screen is represented by a combination of Red, Green, and Blue (RGB) values. We can think of these three values as coordinates in a 3D space. For example:

*   Pure Red: `(255, 0, 0)`
*   Pure Green: `(0, 255, 0)`
*   Pure Blue: `(0, 0, 255)`
*   Black: `(0, 0, 0)`
*   White: `(255, 255, 255)`

## The Distance Formula

To determine if a pixel from the camera feed is "close" to the selected green screen color (the "key color"), we calculate the distance between the two colors in this 3D space. We use the Euclidean distance formula:

```
Distance = sqrt((R1 - R2)^2 + (G1 - G2)^2 + (B1 - B2)^2)
```

Where:

*   `(R1, G1, B1)` are the RGB values of the pixel from the camera.
*   `(R2, G2, B2)` are the RGB values of the key color you selected by clicking on the video.

## Tolerance

The "Tolerance" slider sets a threshold for this distance. The application checks if the calculated distance is less than or greater than the tolerance value:

*   **If `Distance <= Tolerance`:** The pixel's color is considered close enough to the key color, and it is classified as part of the green screen.
*   **If `Distance > Tolerance`:** The pixel's color is too different from the key color, and it is classified as an imperfection.

## Why High Tolerance Makes the Screen Green

When you set the tolerance to a high value (like 200), you are increasing the maximum allowed distance for a color to be considered "green screen." The maximum possible distance between two colors in the RGB space is around 441 (the distance between black and white). A tolerance of 200 is a very large threshold, meaning that a wide range of colors will be classified as part of the green screen.

This is why, at a tolerance of 200, most of the image, including things that are not green to the human eye, will be classified as part of the green screen and colored green in the output.

## Visualization

*   **Previously:** The application was making the "good" green screen areas transparent. When the tolerance was high, most of the screen became transparent, and you were seeing the black background of the web page, which appeared as black and white.
*   **Currently:** The application now colors the "good" green screen areas with a solid, bright green. This makes it much clearer which parts of the image are being correctly identified as the green screen.
