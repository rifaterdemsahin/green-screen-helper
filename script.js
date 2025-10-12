const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const container = document.querySelector('.video-container');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const fullscreenButton = document.getElementById('fullscreen-button');
const toggleChromaButton = document.getElementById('toggle-chroma-button');
const goldenRatioButton = document.getElementById('golden-ratio-button');
const gridLinesButton = document.getElementById('grid-lines-button');
const pickColorButton = document.getElementById('pick-color-button');
const setGreenButton = document.getElementById('set-green-button');
const setBlueButton = document.getElementById('set-blue-button');
const toleranceInput = document.getElementById('tolerance');
const toleranceValue = document.getElementById('tolerance-value');
const context = canvas.getContext('2d');

let stream;
let keyColor = { r: 0, g: 177, b: 64 }; // Default to a standard green screen green
let tolerance = 50;
let chromaKeyEnabled = true;
let goldenRatioEnabled = false;
let gridLinesEnabled = false;
let colorPicking = false;

startButton.addEventListener('click', startCamera);
stopButton.addEventListener('click', stopCamera);
fullscreenButton.addEventListener('click', toggleFullScreen);

toggleChromaButton.addEventListener('click', () => {
    chromaKeyEnabled = !chromaKeyEnabled;
    toggleChromaButton.textContent = chromaKeyEnabled ? '✨ Chroma: On' : '✨ Chroma: Off';
    toggleChromaButton.classList.toggle('active', chromaKeyEnabled);
});

goldenRatioButton.addEventListener('click', () => {
    goldenRatioEnabled = !goldenRatioEnabled;
    goldenRatioButton.classList.toggle('active', goldenRatioEnabled);
});

gridLinesButton.addEventListener('click', () => {
    gridLinesEnabled = !gridLinesEnabled;
    gridLinesButton.classList.toggle('active', gridLinesEnabled);
});

pickColorButton.addEventListener('click', () => {
    colorPicking = true;
    canvas.style.pointerEvents = 'auto';
    pickColorButton.classList.add('active');
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
    if (!colorPicking) return;
    const x = event.offsetX;
    const y = event.offsetY;
    const pixel = context.getImageData(x, y, 1, 1).data;
    keyColor = { r: pixel[0], g: pixel[1], b: pixel[2] };
    console.log('Key color set to:', keyColor);
    colorPicking = false;
    canvas.style.pointerEvents = 'none';
    pickColorButton.classList.remove('active');
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
                const brightness = Math.min(255, distance * 2);
                data[i] = brightness;
                data[i + 1] = brightness;
                data[i + 2] = brightness;
            } else {
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
            }
        }
        context.putImageData(imageData, 0, 0);
    }

    if (goldenRatioEnabled) {
        drawGoldenRatio();
    }

    if (gridLinesEnabled) {
        drawGridLines();
    }

    requestAnimationFrame(analyzeFrame);
}

function drawGoldenRatio() {
    const w = canvas.width;
    const h = canvas.height;
    const phi = 1.618;

    context.strokeStyle = 'rgba(255, 255, 0, 0.7)';
    context.lineWidth = 2;
    context.beginPath();

    let x = w / 2;
    let y = h / 2;
    let radius = Math.min(w, h) / 2;
    let angle = 0;

    for (let i = 0; i < 10; i++) {
        context.arc(x, y, radius, angle, angle + Math.PI / 2);
        radius /= phi;
        angle += Math.PI / 2;
        const newX = x + Math.cos(angle) * radius * phi;
        const newY = y + Math.sin(angle) * radius * phi;
        x = newX;
        y = newY;
    }

    context.stroke();
}

function drawGridLines() {
    const w = canvas.width;
    const h = canvas.height;

    context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    context.lineWidth = 1;
    context.beginPath();

    // Vertical lines
    context.moveTo(w / 3, 0);
    context.lineTo(w / 3, h);
    context.moveTo(w * 2 / 3, 0);
    context.lineTo(w * 2 / 3, h);

    // Horizontal lines
    context.moveTo(0, h / 3);
    context.lineTo(w, h / 3);
    context.moveTo(0, h * 2 / 3);
    context.lineTo(w, h * 2 / 3);

    context.stroke();
}