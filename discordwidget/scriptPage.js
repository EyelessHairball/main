const input = document.getElementById("userId");
const widgetContainer = document.getElementById("discord-status-widget");
const embedCodeContainer = document.getElementById("embedCode");
const copyBtn = document.getElementById("copyBtn");

function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function updateEmbedCode(userId) {
  const actualCode = `<div id="discord-status-widget" data-user-id="${userId}"></div>\n<script src="https://cdn.jsdelivr.net/gh/EyelessHairball/main@main/discordwidget/script.js">
  </script>`;

  let displayCode = escapeHTML(actualCode)
    .replace(/&lt;div/g, '<span class="tag">&lt;div</span>')
    .replace(/id="(.*?)"/g, 'id="<span class="attr">$1</span>"')
    .replace(
      /data-user-id="(.*?)"/g,
      'data-user-id="<span class="value">$1</span>"'
    )
    .replace(/&lt;script/g, '<span class="tag">&lt;script</span>')
    .replace(/src="(.*?)"/g, 'src="<span class="value">$1</span>"')
    .replace(/&gt;/g, "&gt;");

  embedCodeContainer.innerHTML = displayCode;
  embedCodeContainer.dataset.clipboard = actualCode;
}

function updateWidget(userId) {
  if (!userId) return;

  const oldScript = widgetContainer.querySelector("script");
  if (oldScript) oldScript.remove();

  widgetContainer.setAttribute("data-user-id", userId);

  const script = document.createElement("script");
  script.src =
    "https://cdn.jsdelivr.net/gh/EyelessHairball/main@main/discordwidget/script.js";
  widgetContainer.appendChild(script);
  widgetContainer.style.display = "block";

  updateEmbedCode(userId);
}

input.addEventListener("input", () => updateWidget(input.value.trim()));

copyBtn.addEventListener("click", () => {
  const codeText = embedCodeContainer.dataset.clipboard;
  navigator.clipboard.writeText(codeText).then(() => {});
});

updateWidget(input.value.trim());