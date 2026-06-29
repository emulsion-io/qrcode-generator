const typeDefinitions = {
  url: {
    fields: [{ id: "url", label: "Adresse web", type: "url", value: "https://example.com" }],
    build: (v) => v.url || "https://example.com",
  },
  text: {
    fields: [{ id: "text", label: "Texte", type: "textarea", value: "Votre message ici" }],
    build: (v) => v.text || "Votre message ici",
  },
  vcard: {
    fields: [
      { id: "firstName", label: "Prénom", type: "text", value: "Camille" },
      { id: "lastName", label: "Nom", type: "text", value: "Martin" },
      { id: "org", label: "Organisation", type: "text", value: "Studio QR" },
      { id: "title", label: "Fonction", type: "text", value: "Designer" },
      { id: "phone", label: "Téléphone", type: "tel", value: "+33123456789" },
      { id: "email", label: "Email", type: "email", value: "bonjour@example.com" },
      { id: "website", label: "Site web", type: "url", value: "https://example.com" },
    ],
    build: (v) => [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${v.lastName || ""};${v.firstName || ""};;;`,
      `FN:${[v.firstName, v.lastName].filter(Boolean).join(" ")}`,
      `ORG:${v.org || ""}`,
      `TITLE:${v.title || ""}`,
      `TEL:${v.phone || ""}`,
      `EMAIL:${v.email || ""}`,
      `URL:${v.website || ""}`,
      "END:VCARD",
    ].join("\n"),
  },
  email: {
    fields: [
      { id: "email", label: "Destinataire", type: "email", value: "bonjour@example.com" },
      { id: "subject", label: "Sujet", type: "text", value: "Demande d’information" },
      { id: "body", label: "Message", type: "textarea", value: "Bonjour," },
    ],
    build: (v) => `mailto:${v.email || ""}?subject=${encode(v.subject)}&body=${encode(v.body)}`,
  },
  whatsapp: {
    fields: [
      { id: "phone", label: "Numéro avec indicatif", type: "tel", value: "33612345678" },
      { id: "message", label: "Message", type: "textarea", value: "Bonjour, je vous contacte depuis le QR code." },
    ],
    build: (v) => `https://wa.me/${digits(v.phone)}?text=${encode(v.message)}`,
  },
  wifi: {
    fields: [
      { id: "ssid", label: "Nom du réseau", type: "text", value: "Mon Wifi" },
      { id: "password", label: "Mot de passe", type: "text", value: "motdepasse" },
      { id: "encryption", label: "Sécurité", type: "select", value: "WPA", options: ["WPA", "WEP", "nopass"] },
    ],
    build: (v) => `WIFI:T:${v.encryption || "WPA"};S:${escapeWifi(v.ssid)};P:${escapeWifi(v.password)};;`,
  },
  phone: {
    fields: [{ id: "phone", label: "Téléphone", type: "tel", value: "+33123456789" }],
    build: (v) => `tel:${v.phone || ""}`,
  },
  sms: {
    fields: [
      { id: "phone", label: "Téléphone", type: "tel", value: "+33123456789" },
      { id: "message", label: "Message", type: "textarea", value: "Bonjour" },
    ],
    build: (v) => `SMSTO:${v.phone || ""}:${v.message || ""}`,
  },
  calendar: {
    fields: [
      { id: "title", label: "Titre", type: "text", value: "Rendez-vous" },
      { id: "location", label: "Lieu", type: "text", value: "Paris" },
      { id: "start", label: "Début", type: "datetime-local", value: "2026-07-01T09:00" },
      { id: "end", label: "Fin", type: "datetime-local", value: "2026-07-01T10:00" },
      { id: "description", label: "Description", type: "textarea", value: "Événement créé avec Studio QR" },
    ],
    build: (v) => [
      "BEGIN:VEVENT",
      `SUMMARY:${v.title || ""}`,
      `LOCATION:${v.location || ""}`,
      `DTSTART:${formatCalendarDate(v.start)}`,
      `DTEND:${formatCalendarDate(v.end)}`,
      `DESCRIPTION:${v.description || ""}`,
      "END:VEVENT",
    ].join("\n"),
  },
  geo: {
    fields: [
      { id: "lat", label: "Latitude", type: "number", value: "48.8566" },
      { id: "lng", label: "Longitude", type: "number", value: "2.3522" },
    ],
    build: (v) => `geo:${v.lat || "0"},${v.lng || "0"}`,
  },
  socialmedia: {
    fields: [
      { id: "network", label: "Réseau", type: "select", value: "instagram", options: ["instagram", "linkedin", "facebook", "x", "tiktok", "youtube"] },
      { id: "handle", label: "Profil ou identifiant", type: "text", value: "openai" },
    ],
    build: (v) => socialUrl(v.network, v.handle),
  },
};

const colorThemes = {
  black: { dot: "#000000", corner: "#000000", background: "#ffffff", frame: "#000000", frameText: "#ffffff" },
  atelier: { dot: "#000000", corner: "#ffa726", background: "#ffffff", frame: "#ffa726", frameText: "#111111" },
  nocturne: { dot: "#111827", corner: "#60a5fa", background: "#f8fafc", frame: "#111827", frameText: "#f8fafc" },
  corail: { dot: "#1f2937", corner: "#ef6f61", background: "#fff7ed", frame: "#ef6f61", frameText: "#ffffff" },
  menthe: { dot: "#12312b", corner: "#2eb67d", background: "#f3fff8", frame: "#2eb67d", frameText: "#0f241f" },
  encre: { dot: "#0f172a", corner: "#7c3aed", background: "#f8fafc", frame: "#7c3aed", frameText: "#ffffff" },
  soleil: { dot: "#2f241d", corner: "#f59e0b", background: "#fffaf0", frame: "#f59e0b", frameText: "#2f241d" },
  rubis: { dot: "#251018", corner: "#be123c", background: "#fff1f2", frame: "#be123c", frameText: "#ffffff" },
  lagon: { dot: "#082f49", corner: "#06b6d4", background: "#ecfeff", frame: "#06b6d4", frameText: "#082f49" },
  graphite: { dot: "#18181b", corner: "#71717a", background: "#fafafa", frame: "#18181b", frameText: "#ffffff" },
  violette: { dot: "#2e1065", corner: "#a855f7", background: "#faf5ff", frame: "#a855f7", frameText: "#ffffff" },
};

const state = {
  type: "url",
  frame: "none",
  logo: "",
  values: {},
};

const el = {
  typeNav: document.querySelector("#typeNav"),
  dynamicFields: document.querySelector("#dynamicFields"),
  qrPreview: document.querySelector("#qrPreview"),
  previewDevice: document.querySelector("#previewDevice"),
  previewLightMode: document.querySelector("#previewLightMode"),
  previewCard: document.querySelector("#previewCard"),
  frameTitle: document.querySelector("#frameTitle"),
  dotShape: document.querySelector("#dotShape"),
  cornerShape: document.querySelector("#cornerShape"),
  dotColor: document.querySelector("#dotColor"),
  backgroundColor: document.querySelector("#backgroundColor"),
  transparentBackground: document.querySelector("#transparentBackground"),
  cornerColor: document.querySelector("#cornerColor"),
  qrSize: document.querySelector("#qrSize"),
  logoInput: document.querySelector("#logoInput"),
  hideLogoBackground: document.querySelector("#hideLogoBackground"),
  frameText: document.querySelector("#frameText"),
  frameTextEnabled: document.querySelector("#frameTextEnabled"),
  frameColor: document.querySelector("#frameColor"),
  frameTextColor: document.querySelector("#frameTextColor"),
  frameWidth: document.querySelector("#frameWidth"),
  framePicker: document.querySelector("#framePicker"),
  themePicker: document.querySelector("#themePicker"),
};

const qrCode = new QRCodeStyling({
  width: 420,
  height: 420,
  type: "canvas",
  data: "https://example.com",
  margin: 12,
  qrOptions: { errorCorrectionLevel: "H" },
  dotsOptions: { color: "#000000", type: "square" },
  cornersSquareOptions: { color: "#000000", type: "square" },
  cornersDotOptions: { color: "#000000", type: "square" },
  backgroundOptions: { color: "#ffffff" },
  imageOptions: { crossOrigin: "anonymous", margin: 8, imageSize: 0.28, hideBackgroundDots: true },
});

qrCode.append(el.qrPreview);
renderFields();
updateQr();

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach((item) => item.classList.remove("is-active"));
    document.querySelectorAll(".tab-panel").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    document.querySelector(`#tab-${button.dataset.tab}`).classList.add("is-active");
  });
});

el.typeNav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-type]");
  if (!button) return;
  state.type = button.dataset.type;
  document.querySelectorAll(".type-button").forEach((item) => item.classList.toggle("is-active", item === button));
  renderFields();
  updateQr();
});

el.dynamicFields.addEventListener("input", (event) => {
  if (!event.target.name) return;
  state.values[state.type] ||= {};
  state.values[state.type][event.target.name] = event.target.value;
  updateQr();
});

["change", "input"].forEach((eventName) => {
  [el.dotShape, el.cornerShape, el.dotColor, el.backgroundColor, el.transparentBackground, el.cornerColor, el.qrSize, el.hideLogoBackground, el.frameText, el.frameTextEnabled, el.frameColor, el.frameTextColor, el.frameWidth].forEach((node) => {
    node.addEventListener(eventName, updateQr);
  });
});

el.logoInput.addEventListener("change", () => {
  const file = el.logoInput.files?.[0];
  if (!file) {
    state.logo = "";
    updateQr();
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    state.logo = reader.result;
    updateQr();
  });
  reader.readAsDataURL(file);
});

el.framePicker.addEventListener("click", (event) => {
  const button = event.target.closest("[data-frame]");
  if (!button) return;
  state.frame = button.dataset.frame;
  document.querySelectorAll(".frame-choice").forEach((item) => item.classList.toggle("is-active", item === button));
  updateQr();
});

el.themePicker.addEventListener("click", (event) => {
  const button = event.target.closest("[data-theme]");
  if (!button) return;
  applyTheme(button.dataset.theme);
  document.querySelectorAll(".theme-choice").forEach((item) => item.classList.toggle("is-active", item === button));
  updateQr();
});

document.querySelector("#downloadPng").addEventListener("click", () => downloadRaster("png"));
document.querySelector("#downloadJpg").addEventListener("click", () => downloadRaster("jpeg"));
document.querySelector("#downloadSvg").addEventListener("click", downloadSvg);
el.previewLightMode.addEventListener("change", () => {
  el.previewDevice.classList.toggle("is-light-preview", el.previewLightMode.checked);
});

function renderFields() {
  const definition = typeDefinitions[state.type];
  state.values[state.type] ||= {};

  el.dynamicFields.innerHTML = definition.fields.map((field) => {
    const value = state.values[state.type][field.id] ?? field.value ?? "";
    if (field.type === "textarea") {
      return fieldWrap(field, `<textarea name="${field.id}">${escapeHtml(value)}</textarea>`);
    }
    if (field.type === "select") {
      const options = field.options.map((option) => `<option value="${option}" ${option === value ? "selected" : ""}>${labelize(option)}</option>`).join("");
      return fieldWrap(field, `<select name="${field.id}">${options}</select>`);
    }
    return fieldWrap(field, `<input name="${field.id}" type="${field.type}" value="${escapeHtml(value)}">`);
  }).join("");
}

function fieldWrap(field, control) {
  return `<label class="field"><span>${field.label}</span>${control}</label>`;
}

function currentPayload() {
  const definition = typeDefinitions[state.type];
  const values = {};
  definition.fields.forEach((field) => {
    values[field.id] = state.values[state.type]?.[field.id] ?? field.value ?? "";
  });
  return definition.build(values);
}

function updateQr() {
  const size = Number(el.qrSize.value);
  const frameClass = `frame-${state.frame}`;
  const textClass = hasFrameText() ? "has-frame-text" : "no-frame-text";
  const backgroundClass = el.transparentBackground.checked ? "is-transparent-bg" : "has-solid-bg";
  el.previewCard.className = `preview-card ${frameClass} ${textClass} ${backgroundClass}`;
  el.previewCard.style.setProperty("--frame-color", el.frameColor.value);
  el.previewCard.style.setProperty("--frame-text-color", el.frameTextColor.value);
  el.previewCard.style.setProperty("--frame-width", `${frameWidth()}px`);
  el.frameTitle.textContent = frameTitle();
  el.frameTitle.style.color = el.frameTextColor.value;
  el.backgroundColor.disabled = el.transparentBackground.checked;

  qrCode.update({
    width: size,
    height: size,
    data: currentPayload(),
    image: state.logo || undefined,
    dotsOptions: { color: el.dotColor.value, type: el.dotShape.value },
    cornersSquareOptions: { color: el.cornerColor.value, type: el.cornerShape.value },
    cornersDotOptions: { color: el.cornerColor.value, type: el.cornerShape.value === "square" ? "square" : "dot" },
    backgroundOptions: { color: qrBackgroundColor() },
    imageOptions: { crossOrigin: "anonymous", margin: 8, imageSize: 0.28, hideBackgroundDots: el.hideLogoBackground.checked },
  });
}

async function downloadRaster(extension) {
  if (state.frame === "none") {
    await qrCode.download({ name: "qrcode", extension });
    return;
  }

  const blob = await qrCode.getRawData("png");
  const image = await blobToImage(blob);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const layout = exportLayout(image.width);
  canvas.width = layout.width;
  canvas.height = layout.height;

  if (extension === "jpeg" || !el.transparentBackground.checked) {
    ctx.fillStyle = extension === "jpeg" ? "#ffffff" : qrBackgroundColor();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  drawFrame(ctx, layout);
  ctx.drawImage(image, layout.qrX, layout.qrY, layout.size, layout.size);
  drawFrameText(ctx, layout);

  const mime = extension === "jpeg" ? "image/jpeg" : "image/png";
  const link = document.createElement("a");
  link.download = `qrcode.${extension === "jpeg" ? "jpg" : "png"}`;
  link.href = canvas.toDataURL(mime, 0.94);
  link.click();
}

async function downloadSvg() {
  if (state.frame === "none") {
    await qrCode.download({ name: "qrcode", extension: "svg" });
    return;
  }

  const blob = await qrCode.getRawData("svg");
  const svgText = await blob.text();
  const encodedQr = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgText)))}`;
  const size = Number(el.qrSize.value);
  const layout = exportLayout(size);
  const color = el.frameColor.value;
  const textColor = el.frameTextColor.value;
  const title = escapeHtml(frameTitle());
  const frame = svgFrameMarkup(layout, color);
  const background = el.transparentBackground.checked ? "" : `<rect width="100%" height="100%" fill="${qrBackgroundColor()}"/>`;
  const text = hasFrameText() ? `<text x="${layout.width / 2}" y="${layout.textY}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="${layout.fontSize}" font-weight="800" fill="${textColor}">${title}</text>` : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}">
    ${background}
    ${frame}
    <image href="${encodedQr}" x="${layout.qrX}" y="${layout.qrY}" width="${layout.size}" height="${layout.size}"/>
    ${text}
  </svg>`;
  downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "qrcode.svg");
}

function drawFrame(ctx, layout) {
  const color = el.frameColor.value;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = layout.border;

  if (state.frame === "classic") {
    ctx.strokeRect(layout.border / 2, layout.border / 2, layout.width - layout.border, layout.height - layout.border);
  }
  if (state.frame === "ticket") {
    ctx.lineWidth = layout.ticketStroke;
    ctx.lineCap = "round";
    ctx.setLineDash([layout.ticketDash, layout.ticketGap]);
    ctx.strokeRect(layout.ticketInset, layout.ticketInset, layout.width - layout.ticketInset * 2, layout.height - layout.ticketInset * 2);
    ctx.setLineDash([]);
    ctx.lineCap = "butt";
  }
  if (state.frame === "badge") {
    roundedRect(ctx, layout.border, layout.border, layout.width - layout.border * 2, layout.height - layout.border * 2, layout.radius);
    ctx.stroke();
  }
  if (state.frame === "poster" && hasFrameText()) {
    ctx.fillRect(0, layout.posterBandY, layout.width, layout.posterBandHeight);
  }
}

function drawFrameText(ctx, layout) {
  if (!hasFrameText()) return;
  ctx.fillStyle = el.frameTextColor.value;
  ctx.font = `800 ${layout.fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(frameTitle(), layout.width / 2, layout.textY, layout.width * 0.86);
}

function svgFrameMarkup(layout, color) {
  if (state.frame === "classic") {
    return `<rect x="${layout.border / 2}" y="${layout.border / 2}" width="${layout.width - layout.border}" height="${layout.height - layout.border}" fill="none" stroke="${color}" stroke-width="${layout.border}"/>`;
  }
  if (state.frame === "ticket") {
    return `<rect x="${layout.ticketInset}" y="${layout.ticketInset}" width="${layout.width - layout.ticketInset * 2}" height="${layout.height - layout.ticketInset * 2}" fill="none" stroke="${color}" stroke-width="${layout.ticketStroke}" stroke-linecap="round" stroke-dasharray="${layout.ticketDash} ${layout.ticketGap}"/>`;
  }
  if (state.frame === "badge") {
    return `<rect x="${layout.border}" y="${layout.border}" width="${layout.width - layout.border * 2}" height="${layout.height - layout.border * 2}" rx="${layout.radius}" fill="none" stroke="${color}" stroke-width="${layout.border}"/>`;
  }
  if (state.frame === "poster" && hasFrameText()) {
    return `<rect x="0" y="${layout.posterBandY}" width="${layout.width}" height="${layout.posterBandHeight}" fill="${color}"/>`;
  }
  return "";
}

function exportLayout(size) {
  const padding = Math.round(size * 0.12);
  const textEnabled = hasFrameText();
  const border = exportFrameWidth(size);
  const titleHeight = textEnabled && state.frame !== "poster" ? Math.round(size * 0.17) : 0;
  const posterBandHeight = textEnabled && state.frame === "poster" ? Math.round(size * 0.18) : 0;
  const width = size + padding * 2;
  const height = size + padding * 2 + titleHeight + posterBandHeight;
  const qrX = padding;
  const qrY = padding + titleHeight;
  const posterBandY = height - posterBandHeight;
  return {
    size,
    padding,
    titleHeight,
    posterBandHeight,
    posterBandY,
    width,
    height,
    qrX,
    qrY,
    border,
    ticketInset: Math.max(8, border),
    ticketStroke: Math.max(2, Math.round(border * 0.42)),
    ticketDash: Math.max(8, Math.round(border * 1.7)),
    ticketGap: Math.max(7, Math.round(border * 1.25)),
    radius: Math.round(size * 0.08),
    fontSize: Math.max(18, Math.round(size * 0.05)),
    textY: state.frame === "poster" ? posterBandY + posterBandHeight / 2 : padding + titleHeight / 2,
  };
}

function frameWidth() {
  return Number(el.frameWidth.value);
}

function exportFrameWidth(size) {
  return Math.max(2, Math.round(size * (frameWidth() / 420)));
}

function applyTheme(themeName) {
  const theme = colorThemes[themeName];
  if (!theme) return;
  el.dotColor.value = theme.dot;
  el.cornerColor.value = theme.corner;
  el.backgroundColor.value = theme.background;
  el.frameColor.value = theme.frame;
  el.frameTextColor.value = theme.frameText;
}

function hasFrameText() {
  return el.frameTextEnabled.checked && frameTitle().length > 0;
}

function frameTitle() {
  return el.frameText.value.trim();
}

function qrBackgroundColor() {
  return el.transparentBackground.checked ? "transparent" : el.backgroundColor.value;
}

function blobToImage(blob) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.src = URL.createObjectURL(blob);
  });
}

function downloadBlob(blob, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function formatCalendarDate(value) {
  if (!value) return "";
  const [date, time = "00:00"] = value.split("T");
  return `${date.replace(/-/g, "")}T${time.replace(/:/g, "")}00`;
}

function socialUrl(network, handle) {
  const clean = String(handle || "").replace(/^@/, "").trim();
  if (/^https?:\/\//i.test(clean)) return clean;
  const urls = {
    instagram: `https://instagram.com/${clean}`,
    linkedin: `https://linkedin.com/in/${clean}`,
    facebook: `https://facebook.com/${clean}`,
    x: `https://x.com/${clean}`,
    tiktok: `https://tiktok.com/@${clean}`,
    youtube: `https://youtube.com/@${clean}`,
  };
  return urls[network] || clean;
}

function digits(value) {
  return String(value || "").replace(/\D/g, "");
}

function encode(value) {
  return encodeURIComponent(value || "");
}

function escapeWifi(value) {
  return String(value || "").replace(/[\\;,":]/g, "\\$&");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function labelize(value) {
  const labels = {
    nopass: "Sans mot de passe",
    x: "X / Twitter",
  };
  return labels[value] || value.charAt(0).toUpperCase() + value.slice(1);
}
