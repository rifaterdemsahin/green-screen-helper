const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const container = document.querySelector('.container');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const fullscreenButton = document.getElementById('fullscreen-button');
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
fullscreenButton.addEventListener('click', toggleFullScreen);
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

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
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

// Modal handling
const shootingGuideModal = document.getElementById('shooting-guide-modal');
const cameraGuideModal = document.getElementById('camera-guide-modal');

const shootingGuideButton = document.getElementById('shooting-guide-button');
const cameraGuideButton = document.getElementById('camera-guide-button');

const closeButtons = document.querySelectorAll('.close-button');

shootingGuideButton.addEventListener('click', () => {
    shootingGuideModal.style.display = 'block';
});

cameraGuideButton.addEventListener('click', () => {
    cameraGuideModal.style.display = 'block';
    calculateLayout(); // Initialize calculator when modal is opened
});

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        shootingGuideModal.style.display = 'none';
        cameraGuideModal.style.display = 'none';
    });
});

window.addEventListener('click', (event) => {
    if (event.target == shootingGuideModal || event.target == cameraGuideModal) {
        shootingGuideModal.style.display = 'none';
        cameraGuideModal.style.display = 'none';
    }
});

// Camera guide calculator
const roomLengthInput = document.getElementById('room-length');
const screenWidthInput = document.getElementById('screen-width');
const subjectDistanceInput = document.getElementById('subject-distance');
const focalLengthInput = document.getElementById('focal-length');

const cameraSubjectDistResult = document.getElementById('camera-subject-dist');
const cameraScreenDistResult = document.getElementById('camera-screen-dist');
const totalLengthResult = document.getElementById('total-length');
const feasibilityResult = document.getElementById('feasibility');

function calculateLayout() {
    const roomLength = parseFloat(roomLengthInput.value);
    const screenWidth = parseFloat(screenWidthInput.value);
    const subjectDistance = parseFloat(subjectDistanceInput.value);
    const focalLength = parseFloat(focalLengthInput.value);

    // Sony ZV-1 has a 1-inch sensor, which has a crop factor of 2.7.
    // The sensor width is approx 13.2mm.
    const sensorWidth = 13.2;

    if (focalLength > 0 && screenWidth > 0 && subjectDistance > 0) {
        const cameraScreenDist = (focalLength * screenWidth) / sensorWidth;
        const cameraSubjectDist = cameraScreenDist - subjectDistance;
        const totalLength = cameraScreenDist;

        cameraSubjectDistResult.textContent = cameraSubjectDist.toFixed(2);
        cameraScreenDistResult.textContent = cameraScreenDist.toFixed(2);
        totalLengthResult.textContent = totalLength.toFixed(2);

        if (totalLength <= roomLength) {
            feasibilityResult.textContent = 'Good to go!';
            feasibilityResult.className = 'result ok';
        } else {
            feasibilityResult.textContent = 'Room is too small for this setup!';
            feasibilityResult.className = 'result error';
        }

    } else {
        cameraSubjectDistResult.textContent = '...';
        cameraScreenDistResult.textContent = '...';
        totalLengthResult.textContent = '...';
        feasibilityResult.textContent = '...';
        feasibilityResult.className = 'result';
    }
}

roomLengthInput.addEventListener('input', calculateLayout);
screenWidthInput.addEventListener('input', calculateLayout);
subjectDistanceInput.addEventListener('input', calculateLayout);
focalLengthInput.addEventListener('input', calculateLayout);