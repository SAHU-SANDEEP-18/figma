// ──────────────────────────────────────────────
const canvas = document.getElementById("canvas");
const layers = document.getElementById("layers");
const w = document.getElementById("w");
const h = document.getElementById("h");
const bgColor = document.getElementById("bgColor");
const textContent = document.getElementById("textContent");
const textColor = document.getElementById("textColor");
const textContentSection = document.getElementById("textContentSection");
const textColorSection = document.getElementById("textColorSection");
const fontSize = document.getElementById("fontSize");
const fontWeight = document.getElementById("fontWeight");
const modeBtn = document.getElementById("modeBtn");
const alignButtons = document.querySelectorAll(".align-text");

let elements = [];
let selected = null;

const MIN_SIZE = 10;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toggleMode() {
  document.body.classList.toggle("dark");
  modeBtn.innerHTML = document.body.classList.contains("dark")
    ? '<i class="ri-sun-line"></i>'
    : '<i class="ri-moon-line"></i>';
  saveState();
}

// rgb → hex converter (background aur text color ke liye safe)
function toHex(color) {
  if (!color || color === "") return "#000000";
  if (color.startsWith("#")) return color;
  const rgb = color.match(/\d+/g);
  if (!rgb || rgb.length < 3) return "#000000";
  return (
    "#" +
    parseInt(rgb[0]).toString(16).padStart(2, "0") +
    parseInt(rgb[1]).toString(16).padStart(2, "0") +
    parseInt(rgb[2]).toString(16).padStart(2, "0")
  );
}

// Create element
function create(type) {
  const el = document.createElement("div");
  el.className = "element";
  el.id = "el-" + Date.now();
  el.dataset.type = type;
  el.style.left = "50px";
  el.style.top = "50px";
  el.style.width = "140px";
  el.style.height = "70px";
  el.style.transform = "rotate(0deg)";

  if (type === "rect") {
    el.style.background = "#60a5fa";
  } else {
    el.textContent = "Text";
    el.style.fontSize = "16px";
    el.style.fontWeight = "normal";
    el.style.textAlign = "left";
    el.style.color = "#000000"; // Default text color
  }

  canvas.appendChild(el);
  elements.push(el);

  updateZIndices();

  el.onmousedown = (e) => {
    if (e.target.classList.contains("handle")) return;
    select(el);
    drag(el, e);
  };

  select(el);
  saveState();
  updateLayers();
}

function addRect() {
  create("rect");
}
function addText() {
  create("text");
}

// Select function
function select(el) {
  if (selected) {
    selected.classList.remove("selected");
    removeHandles();
  }
  selected = el;
  if (el) {
    el.classList.add("selected");
    addResizeHandles(el);
    addRotateHandle(el);
    updateUI();
  }
  updateLayers();
}

canvas.onclick = (e) => {
  if (e.target === canvas) {
    if (selected) {
      selected.classList.remove("selected");
      removeHandles();
      selected = null;
      updateUI();
      updateLayers();
    }
  }
};

// Drag, Resize, Rotate functions same as before (no change)
function drag(el, e) {
  e.stopPropagation();
  const startX = e.clientX;
  const startY = e.clientY;
  const startLeft = parseInt(el.style.left, 10);
  const startTop = parseInt(el.style.top, 10);

  function onMouseMove(ev) {
    let newLeft = startLeft + (ev.clientX - startX);
    let newTop = startTop + (ev.clientY - startY);
    newLeft = clamp(newLeft, 0, canvas.clientWidth - el.clientWidth);
    newTop = clamp(newTop, 0, canvas.clientHeight - el.clientHeight);
    el.style.left = newLeft + "px";
    el.style.top = newTop + "px";
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener(
    "mouseup",
    () => {
      document.removeEventListener("mousemove", onMouseMove);
      saveState();
    },
    { once: true },
  );
}

function addResizeHandles(el) {
  ["tl", "tr", "bl", "br"].forEach((corner) => {
    const handle = document.createElement("div");
    handle.className = `handle ${corner}`;
    el.appendChild(handle);
    handle.onmousedown = (e) => {
      e.stopPropagation();
      resize(el, e, corner);
    };
  });
}

function resize(el, e, corner) {
  const startX = e.clientX;
  const startY = e.clientY;
  const startLeft = parseInt(el.style.left, 10);
  const startTop = parseInt(el.style.top, 10);
  const startWidth = parseInt(el.style.width, 10);
  const startHeight = parseInt(el.style.height, 10);

  function onMouseMove(ev) {
    let deltaX = ev.clientX - startX;
    let deltaY = ev.clientY - startY;
    let newLeft = startLeft;
    let newTop = startTop;
    let newWidth = startWidth;
    let newHeight = startHeight;

    if (corner.includes("l")) {
      newWidth -= deltaX;
      newLeft += deltaX;
    } else newWidth += deltaX;
    if (corner.includes("t")) {
      newHeight -= deltaY;
      newTop += deltaY;
    } else newHeight += deltaY;

    newWidth = Math.max(MIN_SIZE, newWidth);
    newHeight = Math.max(MIN_SIZE, newHeight);

    if (newLeft < 0) newLeft = 0;
    if (newTop < 0) newTop = 0;
    if (newLeft + newWidth > canvas.clientWidth)
      newWidth = canvas.clientWidth - newLeft;
    if (newTop + newHeight > canvas.clientHeight)
      newHeight = canvas.clientHeight - newTop;

    el.style.left = newLeft + "px";
    el.style.top = newTop + "px";
    el.style.width = newWidth + "px";
    el.style.height = newHeight + "px";

    updateUI();
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener(
    "mouseup",
    () => {
      document.removeEventListener("mousemove", onMouseMove);
      saveState();
    },
    { once: true },
  );
}

function addRotateHandle(el) {
  const handle = document.createElement("div");
  handle.className = "handle rotate";
  handle.style.width = "8px";
  handle.style.height = "8px";
  handle.style.background = "#6366f1";
  handle.style.top = "-12px";
  handle.style.left = "50%";
  handle.style.transform = "translateX(-50%)";
  handle.style.cursor = "grab";
  el.appendChild(handle);

  handle.onmousedown = (e) => {
    e.stopPropagation();
    rotate(el, e);
  };
}

function rotate(el, e) {
  const rect = el.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  function onMouseMove(ev) {
    const deltaX = ev.clientX - centerX;
    const deltaY = ev.clientY - centerY;
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) - 90;
    el.style.transform = `rotate(${angle}deg)`;
  }

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener(
    "mouseup",
    () => {
      document.removeEventListener("mousemove", onMouseMove);
      saveState();
    },
    { once: true },
  );
}

function removeHandles() {
  document.querySelectorAll(".handle").forEach((h) => h.remove());
}

// ─── UI Update (text color bhi update hoga) ───
function updateUI() {
  if (!selected) {
    w.value = h.value = "";
    bgColor.value = "#60a5fa";
    textColor.value = "#000000";
    textContent.value = "";
    fontSize.value = "";
    fontWeight.value = "";
    textContentSection.style.display = "none";
    textColorSection.style.display = "none";
    alignButtons.forEach((btn) => btn.classList.remove("active-align"));
    return;
  }

  w.value = parseInt(selected.style.width, 10) || "";
  h.value = parseInt(selected.style.height, 10) || "";
  bgColor.value = toHex(
    selected.style.backgroundColor || selected.style.background || "#60a5fa",
  );

  if (selected.dataset.type === "text") {
    textContentSection.style.display = "block";
    textColorSection.style.display = "block";
    textContent.value = selected.textContent;
    textColor.value = toHex(selected.style.color || "#000000");
    fontSize.value = parseInt(selected.style.fontSize, 10) || "";
    fontWeight.value = selected.style.fontWeight || "normal";

    alignButtons.forEach((btn) => {
      btn.classList.toggle(
        "active-align",
        btn.dataset.align === selected.style.textAlign,
      );
    });
  } else {
    textContentSection.style.display = "none";
    textColorSection.style.display = "none";
  }
}

// ─── Property bindings ───
w.oninput = () => {
  if (selected) selected.style.width = Math.max(MIN_SIZE, w.value) + "px";
  saveState();
};
h.oninput = () => {
  if (selected) selected.style.height = Math.max(MIN_SIZE, h.value) + "px";
  saveState();
};
bgColor.oninput = () => {
  if (selected) {
    selected.style.background = bgColor.value;
    saveState();
  }
};
textContent.oninput = () => {
  if (selected && selected.dataset.type === "text") {
    selected.textContent = textContent.value;
    saveState();
  }
};
textColor.oninput = () => {
  if (selected && selected.dataset.type === "text") {
    selected.style.color = textColor.value;
    saveState();
  }
};
fontSize.oninput = () => {
  if (selected && selected.dataset.type === "text") {
    selected.style.fontSize = fontSize.value + "px";
    saveState();
  }
};
fontWeight.onchange = () => {
  if (selected && selected.dataset.type === "text") {
    selected.style.fontWeight = fontWeight.value;
    saveState();
  }
};

alignButtons.forEach((btn) => {
  btn.onclick = () => {
    if (selected && selected.dataset.type === "text") {
      selected.style.textAlign = btn.dataset.align;
      alignButtons.forEach((b) => b.classList.remove("active-align"));
      btn.classList.add("active-align");
      saveState();
    }
  };
});

// Layer, Keyboard, Save/Load, Export functions same as before (no change needed)
function layerUp() {
  if (!selected) return;
  const idx = elements.indexOf(selected);
  if (idx < elements.length - 1) {
    [elements[idx], elements[idx + 1]] = [elements[idx + 1], elements[idx]];
    updateZIndices();
    saveState();
    updateLayers();
  }
}

function layerDown() {
  if (!selected) return;
  const idx = elements.indexOf(selected);
  if (idx > 0) {
    [elements[idx], elements[idx - 1]] = [elements[idx - 1], elements[idx]];
    updateZIndices();
    saveState();
    updateLayers();
  }
}

function updateZIndices() {
  elements.forEach((el, i) => (el.style.zIndex = i + 1));
}

document.addEventListener("keydown", (e) => {
  if (!selected) return;
  const step = 5;
  let left = parseInt(selected.style.left, 10);
  let top = parseInt(selected.style.top, 10);

  if (e.key === "ArrowLeft") left -= step;
  if (e.key === "ArrowRight") left += step;
  if (e.key === "ArrowUp") top -= step;
  if (e.key === "ArrowDown") top += step;

  left = clamp(left, 0, canvas.clientWidth - selected.clientWidth);
  top = clamp(top, 0, canvas.clientHeight - selected.clientHeight);

  selected.style.left = left + "px";
  selected.style.top = top + "px";

  if (e.key === "Delete") {
    selected.remove();
    elements.splice(elements.indexOf(selected), 1);
    selected = null;
    updateLayers();
    saveState();
  }
  if (e.key === "Escape") {
    selected?.classList.remove("selected");
    removeHandles();
    selected = null;
    updateUI();
  }
  saveState();
});

function updateLayers() {
  layers.innerHTML = "";
  elements
    .slice()
    .reverse()
    .forEach((el, i) => {
      const d = document.createElement("div");
      d.className = "layer" + (el === selected ? " active" : "");
      d.textContent = `${elements.length - i} • ${el.dataset.type}`;
      d.onclick = () => select(el);
      layers.appendChild(d);
    });
}

function saveState() {
  const data = elements.map((el) => ({
    id: el.id,
    type: el.dataset.type,
    x: el.style.left,
    y: el.style.top,
    width: el.style.width,
    height: el.style.height,
    styles: {
      background: el.style.background,
      color: el.style.color, // ← text color save ho raha
      fontSize: el.style.fontSize,
      fontWeight: el.style.fontWeight,
      textAlign: el.style.textAlign,
      transform: el.style.transform,
    },
    content: el.textContent || "",
  }));
  localStorage.setItem("design", JSON.stringify(data));
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

function loadState() {
  const saved = localStorage.getItem("design");
  if (saved) {
    const data = JSON.parse(saved);
    data.forEach((item) => {
      const el = document.createElement("div");
      el.className = "element";
      el.id = item.id;
      el.dataset.type = item.type;
      el.style.left = item.x;
      el.style.top = item.y;
      el.style.width = item.width;
      el.style.height = item.height;
      el.style.transform = item.styles.transform || "rotate(0deg)";

      if (item.type === "rect") {
        el.style.background = item.styles.background;
      } else {
        el.textContent = item.content;
        el.style.fontSize = item.styles.fontSize;
        el.style.fontWeight = item.styles.fontWeight;
        el.style.textAlign = item.styles.textAlign;
        el.style.color = item.styles.color || "#000000"; // ← load text color
      }

      canvas.appendChild(el);
      elements.push(el);

      el.onmousedown = (e) => {
        if (e.target.classList.contains("handle")) return;
        select(el);
        drag(el, e);
      };
    });
    updateZIndices();
    updateLayers();
  }

  if (localStorage.getItem("darkMode") === "true") toggleMode();
}

function exportJSON() {
  const data = elements.map((el) => ({
    id: el.id,
    type: el.dataset.type,
    x: el.style.left,
    y: el.style.top,
    width: el.style.width,
    height: el.style.height,
    styles: {
      background: el.style.background,
      color: el.style.color,
      fontSize: el.style.fontSize,
      fontWeight: el.style.fontWeight,
      textAlign: el.style.textAlign,
      transform: el.style.transform,
    },
    content: el.textContent || "",
  }));
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "design.json";
  a.click();
}

function exportHTML() {
  const html = `<div style="position:relative;width:${canvas.style.width};height:${canvas.style.height};background:${canvas.style.background};">${canvas.innerHTML}</div>`;
  const blob = new Blob([html], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "design.html";
  a.click();
}

// Init
loadState();
