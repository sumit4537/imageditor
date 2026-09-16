# 🪄 Embrod - Advanced Photo Resizer & Online Editor

**Embrod** is a web-based photo editor and high-precision image resizer. Built on the HTML5 Canvas API, it lets users adjust, crop, filter and export images completely client-side without sending data to external servers.

---

## ✨ Features

* **Advanced Resizing Engine:**
  * **Pixels (px):** Custom width and height targeting with automatic aspect ratio locking.
  * **Percentage (%):** Fast scale adjustments (25%, 50%, 75%, 100%) or slider control.
  * **Social Media & Standard Presets:** Pre-configured sizes for Instagram Posts/Stories, YouTube Thumbnails, Facebook Cover, Twitter Headers, Full HD and 4K.
  * **Print Unit Conversions:** Accurate measurements in Inches and Centimeters calculated at **300 DPI**.
* **Background Eraser:** Smart canvas color-keying to remove solid backgrounds with adjustable tolerance.
* **Real-Time Image Filters:** Interactive sliders for brightness, contrast, saturation, grayscale, sepia and blur adjustments.
* **Transformations:** Quick -90°/+90° canvas rotations along with horizontal and vertical flipping.
* **Flexible Exporting:** Download output media in **PNG** (with transparency support), **JPG**, or **WebP** formats with custom quality compression sliders.
* **100% Private & Secure:** All processing is handled locally within your web browser. No image data is stored or uploaded.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Engine:** HTML5 Canvas API
* **Icons & Fonts:** FontAwesome 6.4, Google Fonts (*Plus Jakarta Sans*)

---

## 📁 File Structure

```text
embrod/
├── index.html   # Main workspace markup, tabs, and canvas dropzone
├── style.css    # Glassmorphism UI styling, dynamic animations, and nature backdrop
└── script.js    # Image manipulation, canvas rendering, and file handlers
