(function () {
  const DISCORD_ID = "1311387282460119100";
  const WS_URL = "wss://api.lanyard.rest/socket";
  const container = document.getElementById("discord-status-widget");

  if (!container) return;

  const style = document.createElement("style");
  style.textContent = `
    body{background:#202225;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;padding:20px}
    #discord-status-widget{background:#2f3136;font-family:"Segoe UI",Tahoma,Geneva,Verdana,sans-serif;border-radius:8px;padding:20px;max-width:400px;width:100%;color:#dcddde;box-sizing:border-box}
    .user-header{display:flex;align-items:center;gap:12px;margin-bottom:16px}
    .avatar-container{position:relative}
    .avatar{width:60px;height:60px;border-radius:50%}
    .status-indicator{position:absolute;bottom:0;right:0;width:18px;height:18px;border-radius:50%;border:3px solid #2f3136}
    .status-online{background:#23a559}
    .status-idle{background:#f0b232}
    .status-dnd{background:#f23f43}
    .status-offline{background:#80848e}
    .user-info h2{margin:0;font-size:18px;color:#fff}
    .username{margin:0;font-size:14px;color:#b9bbbe}
    .activity{background:#202225;border-radius:6px;padding:12px;margin-bottom:10px}
    .activity:last-child{margin-bottom:0}
    .activity-header{font-weight:600;font-size:12px;text-transform:uppercase;color:#b9bbbe;margin-bottom:8px}
    .activity-content{display:flex;align-items:center;gap:12px}
    .activity-image{width:60px;height:60px;border-radius:8px;flex-shrink:0}
    .activity-details{flex:1;min-width:0}
    .activity-name{font-weight:600;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .activity-state{font-size:14px;color:#b9bbbe;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .custom-status{display:flex;align-items:center;gap:8px;font-size:14px}
    .custom-emoji{font-size:20px}
    .loading{text-align:center;color:#b9bbbe}
    .error{color:#f23f43;text-align:center}
  `;
  document.head.appendChild(style);

  container.innerHTML = `<div class="loading">Loading…</div>`;

  let socket;
  let lastHTML = "";

  function connect() {
    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      socket.send(JSON.stringify({
        op: 2,
        d: { subscribe_to_id: DISCORD_ID }
      }));
    };

    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.op === 0 && (msg.t === "INIT_STATE" || msg.t === "PRESENCE_UPDATE")) {
        render(msg.d);
      }
    };

    socket.onclose = () => setTimeout(connect, 3000);
    socket.onerror = () => socket.close();
  }

  function render(data) {
    const { discord_user, discord_status, activities } = data;

    const avatar = discord_user.avatar
      ? `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png?size=128`
      : `https://cdn.discordapp.com/embed/avatars/0.png`;

    let html = `
      <div class="user-header">
        <div class="avatar-container">
          <img class="avatar" src="${avatar}">
          <div class="status-indicator status-${discord_status}"></div>
        </div>
        <div class="user-info">
          <h2>${discord_user.display_name || discord_user.username}</h2>
          <p class="username">@${discord_user.username}</p>
        </div>
      </div>
    `;

    if (activities?.length) {
      activities.forEach(a => html += activityHTML(a));
    }

    if (html !== lastHTML) {
      lastHTML = html;
      container.innerHTML = html;
    }
  }

  function activityHTML(a) {
    if (a.type === 4) {
      return `
        <div class="activity">
          <div class="custom-status">
            ${a.emoji ? `<span class="custom-emoji">${a.emoji.name}</span>` : ""}
            <span>${a.state || ""}</span>
          </div>
        </div>
      `;
    }

    const labels = { 0: "Playing", 2: "Listening to", 3: "Watching" };
    const img = a.assets?.large_image
      ? a.assets.large_image.startsWith("mp:")
        ? a.assets.large_image.replace("mp:", "https://media.discordapp.net/")
        : `https://cdn.discordapp.com/app-assets/${a.application_id}/${a.assets.large_image}.png`
      : "";

    return `
      <div class="activity">
        <div class="activity-header">${labels[a.type] || "Activity"} ${a.name}</div>
        <div class="activity-content">
          ${img ? `<img class="activity-image" src="${img}">` : ""}
          <div class="activity-details">
            ${a.details ? `<div class="activity-name">${a.details}</div>` : ""}
            ${a.state ? `<div class="activity-state">${a.state}</div>` : ""}
          </div>
        </div>
      </div>
    `;
  }

  connect();
})();
