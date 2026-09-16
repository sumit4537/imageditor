// --- 1. Tab Navigation ---
function switchTab(tabId) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    const targetSection = document.getElementById(tabId);
    if (targetSection) targetSection.classList.add('active');

    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(tabId)) {
            link.classList.add('active');
        }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- 2. Canvas & Image State ---
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const canvasWrapper = document.getElementById('canvasWrapper');
const canvasToolbar = document.getElementById('canvasToolbar');

let originalImage = null;
let currentWidth = 0;
let currentHeight = 0;
let aspectRatio = 1;
let rotation = 0;
let flipH = 1;
let flipV = 1;

const DPI = 300; // Standard High-Res DPI for inch/cm conversion

// File Upload Handlers
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) loadImage(e.target.files[0]);
});

dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = '#22c55e'; });
dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = '#4ade80'; });
dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) loadImage(e.dataTransfer.files[0]);
});

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            currentWidth = img.width;
            currentHeight = img.height;
            aspectRatio = img.width / img.height;
            rotation = 0; flipH = 1; flipV = 1;

            // Reset resize inputs
            document.getElementById('resizeWidth').value = currentWidth;
            document.getElementById('resizeHeight').value = currentHeight;
            document.getElementById('scalePercent').value = 100;
            document.getElementById('valPercent').textContent = '100%';

            dropzone.style.display = 'none';
            canvasWrapper.style.display = 'block';
            canvasToolbar.style.display = 'flex';

            renderCanvas();
            // Add canvas entrance effect
            canvas.style.opacity = '0';
            canvas.style.transform = 'scale(0.95)';
            canvas.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

            setTimeout(() => {
                canvas.style.opacity = '1';
                canvas.style.transform = 'scale(1)';
            }, 50);
            showToast('Image loaded successfully!');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// --- 3. Advanced Resizer Logic ---
function changeResizeUnit() {
    const unit = document.getElementById('resizeUnit').value;
    const dimInputs = document.getElementById('dimensionInputs');
    const pctInputs = document.getElementById('percentageInputs');
    const presetInputs = document.getElementById('presetInputs');

    dimInputs.style.display = (unit === 'px' || unit === 'in' || unit === 'cm') ? 'block' : 'none';
    pctInputs.style.display = (unit === 'percent') ? 'block' : 'none';
    presetInputs.style.display = (unit === 'preset') ? 'block' : 'none';

    if (unit === 'px') {
        document.getElementById('lblWidth').textContent = 'Width (px):';
        document.getElementById('lblHeight').textContent = 'Height (px):';
        document.getElementById('resizeWidth').value = Math.round(currentWidth);
        document.getElementById('resizeHeight').value = Math.round(currentHeight);
    } else if (unit === 'in') {
        document.getElementById('lblWidth').textContent = 'Width (in @ 300DPI):';
        document.getElementById('lblHeight').textContent = 'Height (in @ 300DPI):';
        document.getElementById('resizeWidth').value = (currentWidth / DPI).toFixed(2);
        document.getElementById('resizeHeight').value = (currentHeight / DPI).toFixed(2);
    } else if (unit === 'cm') {
        document.getElementById('lblWidth').textContent = 'Width (cm @ 300DPI):';
        document.getElementById('lblHeight').textContent = 'Height (cm @ 300DPI):';
        document.getElementById('resizeWidth').value = ((currentWidth / DPI) * 2.54).toFixed(2);
        document.getElementById('resizeHeight').value = ((currentHeight / DPI) * 2.54).toFixed(2);
    }
}

function handleWidthInput() {
    const lock = document.getElementById('lockAspect').checked;
    const unit = document.getElementById('resizeUnit').value;
    const val = parseFloat(document.getElementById('resizeWidth').value) || 0;

    if (lock && val > 0 && aspectRatio > 0) {
        document.getElementById('resizeHeight').value = (val / aspectRatio).toFixed(unit === 'px' ? 0 : 2);
    }
}

function handleHeightInput() {
    const lock = document.getElementById('lockAspect').checked;
    const unit = document.getElementById('resizeUnit').value;
    const val = parseFloat(document.getElementById('resizeHeight').value) || 0;

    if (lock && val > 0 && aspectRatio > 0) {
        document.getElementById('resizeWidth').value = (val * aspectRatio).toFixed(unit === 'px' ? 0 : 2);
    }
}

function handlePercentInput() {
    const pct = parseInt(document.getElementById('scalePercent').value);
    document.getElementById('valPercent').textContent = `${pct}%`;
}

function setQuickPercent(pct) {
    document.getElementById('scalePercent').value = pct;
    document.getElementById('valPercent').textContent = `${pct}%`;
    applyResize();
}

function applyPresetSelection() {
    const preset = document.getElementById('presetSelect').value;
    if (!preset) return;
    const [w, h] = preset.split('x').map(Number);
    currentWidth = w;
    currentHeight = h;
    renderCanvas();
    showToast(`Preset applied: ${w} x ${h} px`);
}

function applyResize() {
    if (!originalImage) return;

    const unit = document.getElementById('resizeUnit').value;

    if (unit === 'px') {
        currentWidth = parseFloat(document.getElementById('resizeWidth').value) || originalImage.width;
        currentHeight = parseFloat(document.getElementById('resizeHeight').value) || originalImage.height;
    } else if (unit === 'in') {
        const inW = parseFloat(document.getElementById('resizeWidth').value) || 1;
        const inH = parseFloat(document.getElementById('resizeHeight').value) || 1;
        currentWidth = Math.round(inW * DPI);
        currentHeight = Math.round(inH * DPI);
    } else if (unit === 'cm') {
        const cmW = parseFloat(document.getElementById('resizeWidth').value) || 1;
        const cmH = parseFloat(document.getElementById('resizeHeight').value) || 1;
        currentWidth = Math.round((cmW / 2.54) * DPI);
        currentHeight = Math.round((cmH / 2.54) * DPI);
    } else if (unit === 'percent') {
        const pct = parseInt(document.getElementById('scalePercent').value) / 100;
        currentWidth = Math.round(originalImage.width * pct);
        currentHeight = Math.round(originalImage.height * pct);
    }

    renderCanvas();
    showToast(`Resized to ${Math.round(currentWidth)} x ${Math.round(currentHeight)} px`);
}

// --- 4. Render Engine ---
function renderCanvas() {
    if (!originalImage) return;

    if (rotation % 180 !== 0) {
        canvas.width = currentHeight;
        canvas.height = currentWidth;
    } else {
        canvas.width = currentWidth;
        canvas.height = currentHeight;
    }

    document.getElementById('dimInfo').textContent = `${Math.round(canvas.width)} x ${Math.round(canvas.height)} px`;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply Filter Adjustments
    const b = document.getElementById('brightness').value;
    const c = document.getElementById('contrast').value;
    const s = document.getElementById('saturation').value;
    const g = document.getElementById('grayscale').value;
    const sep = document.getElementById('sepia').value;
    const bl = document.getElementById('blur').value;

    ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%) grayscale(${g}%) sepia(${sep}%) blur(${bl}px)`;

    // Apply Rotation & Flips
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH, flipV);

    ctx.drawImage(originalImage, -currentWidth / 2, -currentHeight / 2, currentWidth, currentHeight);
    ctx.restore();
}

function updateFilters() {
    document.getElementById('valBrightness').textContent = document.getElementById('brightness').value + '%';
    document.getElementById('valContrast').textContent = document.getElementById('contrast').value + '%';
    document.getElementById('valSaturation').textContent = document.getElementById('saturation').value + '%';
    document.getElementById('valGrayscale').textContent = document.getElementById('grayscale').value + '%';
    document.getElementById('valSepia').textContent = document.getElementById('sepia').value + '%';
    document.getElementById('valBlur').textContent = document.getElementById('blur').value + 'px';
    renderCanvas();
}

function rotateImage(deg) {
    rotation = (rotation + deg) % 360;
    renderCanvas();
}

function flipImage(dir) {
    if (dir === 'h') flipH *= -1;
    if (dir === 'v') flipV *= -1;
    renderCanvas();
}

// --- 5. Background Color Removal ---
function removeBackgroundAuto() {
    if (!originalImage) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const tolerance = parseInt(document.getElementById('bgTolerance').value);

    // Target top-left corner color as background baseline
    const targetR = data[0], targetG = data[1], targetB = data[2];

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const diff = Math.sqrt((r - targetR) ** 2 + (g - targetG) ** 2 + (b - targetB) ** 2);
        if (diff < tolerance * 2.5) {
            data[i + 3] = 0; // Alpha channel to transparent
        }
    }

    ctx.putImageData(imgData, 0, 0);
    showToast('Background erased!');
}

// --- 6. Reset & Download Engine ---
function resetEditor() {
    if (!originalImage) return;
    currentWidth = originalImage.width;
    currentHeight = originalImage.height;
    aspectRatio = currentWidth / currentHeight;
    rotation = 0; flipH = 1; flipV = 1;

    document.getElementById('brightness').value = 100;
    document.getElementById('contrast').value = 100;
    document.getElementById('saturation').value = 100;
    document.getElementById('grayscale').value = 0;
    document.getElementById('sepia').value = 0;
    document.getElementById('blur').value = 0;

    document.getElementById('resizeUnit').value = 'px';
    changeResizeUnit();
    updateFilters();
    showToast('Editor reset');
}

function downloadImage(format) {
    if (!originalImage) return;
    const quality = parseInt(document.getElementById('exportQuality').value) / 100;
    const link = document.createElement('a');
    link.download = `embrod-resized-photo.${format}`;
    link.href = canvas.toDataURL(`image/${format}`, quality);
    link.click();
    showToast(`Downloaded as ${format.toUpperCase()}`);
}

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => q.parentElement.classList.toggle('open'));
});

// Contact Form
document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Message sent! We will reply soon.');
    e.target.reset();
});

// Notification Toast
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}