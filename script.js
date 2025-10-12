const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const toggleChromaButton = document.getElementById('toggle-chroma-button');
const setGreenButton = document.getElementById('set-green-button');
const setBlueButton = document.getElementById('set-blue-button');
const toleranceInput = document.getElementById('tolerance');
const toleranceValue = document.getElementById('tolerance-value');
const context = canvas.getContext('2d');

let stream;
let keyColor = { r: 0, g: 177, b: 64 }; // Default to a standard green screen green
let tolerance = 50;
let chromaKeyEnabled = true;

startButton.addEventListener('click', startCamera);
stopButton.addEventListener('click', stopCamera);
toggleChromaButton.addEventListener('click', () => {
    chromaKeyEnabled = !chromaKeyEnabled;
});
setGreenButton.addEventListener('click', () => keyColor = { r: 0, g: 177, b: 64 });
setBlueButton.addEventListener('click', () => keyColor = { r: 0, g: 0, b: 255 });
canvas.addEventListener('click', pickColor);
toleranceInput.addEventListener('input', () => {
    tolerance = toleranceInput.value;
    toleranceValue.textContent = tolerance;
});

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            requestAnimationFrame(analyzeFrame);
        });
    } catch (err) {
        console.error('Error accessing camera:', err);
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
}

function pickColor(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    const pixel = context.getImageData(x, y, 1, 1).data;
    keyColor = { r: pixel[0], g: pixel[1], b: pixel[2] };
    console.log('Key color set to:', keyColor);
}

function analyzeFrame() {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (chromaKeyEnabled) {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const distance = Math.sqrt(
                Math.pow(r - keyColor.r, 2) +
                Math.pow(g - keyColor.g, 2) +
                Math.pow(b - keyColor.b, 2)
            );

            if (distance > tolerance) {
                // This pixel is not part of the background.
                // The further away the color, the brighter the pixel.
                const brightness = Math.min(255, distance * 2);
                data[i] = brightness;     // r
                data[i + 1] = brightness; // g
                data[i + 2] = brightness; // b
            } else {
                // This pixel is considered part of the background.
                // Make it black.
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
            }
        }
        context.putImageData(imageData, 0, 0);
    }

    requestAnimationFrame(analyzeFrame);
}
