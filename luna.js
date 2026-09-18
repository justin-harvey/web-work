/* Luna, click anywhere and she runs there. Sprite + walk animation reused from justin-bio. */
(function () {
  const S = {
    sheet: "luna-sprite.png",
    frameW: 285, frameH: 285,
    renderW: 72, renderH: 72,
    anims: {
      walking: { row: 0, start: 0, frames: 3, dur: 0.4, loop: true },
      sitting: { row: 0, start: 3, frames: 3, dur: 1.2, loop: false },
      barking: { row: 1, start: 0, frames: 4, dur: 0.8, loop: false }
    },
    restFrame: { row: 1, col: 5 },
    walkSpeed: 1.7
  };
  const v = S.renderW / S.frameW;
  const A = S.frameW * v; // rendered px per frame

  let luna, pos = { x: 24, y: 0 }, target = null, moving = false,
      curAnim = "", facing = "right", restTimer = null;

  function sheetDims() {
    const a = Object.values(S.anims);
    const cols = Math.max(...a.map(x => x.start + x.frames), S.restFrame.col + 1);
    const rows = Math.max(...a.map(x => x.row), S.restFrame.row) + 1;
    return { w: cols * S.frameW * v, h: rows * S.frameH * v };
  }

  function injectStyle() {
    const d = sheetDims();
    const kf = Object.entries(S.anims).map(([name, a]) => {
      const from = a.start * A, to = (a.start + a.frames) * A, y = a.row * S.frameH * v;
      return `@keyframes luna-${name}{from{background-position:-${from}px -${y}px}` +
             `to{background-position:-${to}px -${y}px}}`;
    }).join("\n");
    const st = document.createElement("style");
    st.textContent = kf + `
    .luna-sprite{position:fixed;left:0;top:0;width:${S.renderW}px;height:${S.renderH}px;
      background:url(${S.sheet}) no-repeat;background-size:${d.w}px ${d.h}px;
      pointer-events:none;z-index:9999;filter:drop-shadow(0 6px 6px rgba(0,0,0,.35))}
    .luna-flip{transform:scaleX(-1)}`;
    document.head.appendChild(st);
  }

  function animCss(name) {
    const a = S.anims[name];
    return `luna-${name} ${a.dur}s steps(${a.frames}) ${a.loop ? "infinite" : 1} forwards`;
  }
  function setAnim(name) {
    if (curAnim === name) return;
    curAnim = name;
    luna.style.animation = "none";
    void luna.offsetHeight; // reflow so the animation restarts
    luna.style.animation = animCss(name);
  }
  function rest() {
    curAnim = "resting";
    luna.style.animation = "none";
    luna.style.backgroundPosition =
      `-${S.restFrame.col * A}px -${S.restFrame.row * S.frameH * v}px`;
  }
  function place() { luna.style.left = pos.x + "px"; luna.style.top = pos.y + "px"; }

  function arrive() {
    moving = false;
    setAnim(Math.random() > 0.5 ? "barking" : "sitting");
    if (restTimer) clearTimeout(restTimer);
    restTimer = setTimeout(rest, 1300);
  }

  function step() {
    if (!target) { arrive(); return; }
    const dx = target.x - pos.x, dy = target.y - pos.y, dist = Math.hypot(dx, dy);
    if (dist < S.walkSpeed) { pos.x = target.x; pos.y = target.y; place(); target = null; arrive(); return; }
    if (Math.abs(dx) > 0.5) {
      facing = dx > 0 ? "right" : "left";
      luna.className = facing === "left" ? "luna-sprite luna-flip" : "luna-sprite";
    }
    const t = S.walkSpeed / dist;
    pos.x += dx * t; pos.y += dy * t; place();
    requestAnimationFrame(step);
  }

  function goTo(x, y) {
    target = { x: x - S.renderW / 2, y: y - S.renderH / 2 };
    if (restTimer) clearTimeout(restTimer);
    setAnim("walking");
    if (!moving) { moving = true; requestAnimationFrame(step); }
  }

  function init() {
    injectStyle();
    luna = document.createElement("div");
    luna.className = "luna-sprite";
    luna.setAttribute("aria-hidden", "true");
    document.body.appendChild(luna);
    pos = { x: 24, y: window.innerHeight - S.renderH - 20 };
    place(); rest();
    document.addEventListener("click", e => goTo(e.clientX, e.clientY));
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
