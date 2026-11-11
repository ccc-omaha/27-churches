/* 27 Churches by 2027
   All editable content lives in /content/*.json (edited through Pages CMS).
   This file only renders it. */
(async function () {
  const GOAL = 27;
  const PLACEHOLDERS = ["/images/placeholder-1.jpg", "/images/placeholder-2.jpg"];
  const $ = s => document.querySelector(s);
  const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const italics = t => esc(t).replace(/\*(.+?)\*/g, "<em>$1</em>");

  let top = {}, churches = [], bottom = {};
  try {
    const get = f => fetch(`/content/${f}`, { cache: "no-cache" }).then(r => r.json());
    [top, churches, bottom] = await Promise.all([get("top.json"), get("churches.json"), get("bottom.json")]);
  } catch (e) {
    console.error("Could not load content files", e);
    return;
  }

  /* ---------- page text ---------- */
  const setText = (id, v) => { if (v) $(id).textContent = v; };
  setText("#c-eyebrow", top.eyebrow);
  setText("#c-headline", top.headline);
  setText("#c-accent", top.headlineAccent);
  setText("#c-progress", top.progressLabel);
  setText("#c-foot-h", bottom.heading);
  setText("#c-foot-p", bottom.text);
  if (Array.isArray(top.intro) && top.intro.length)
    $("#c-intro").innerHTML = top.intro.filter(Boolean).map(p => `<p>${italics(p)}</p>`).join("");

  /* ---------- churches ---------- */
  const listed = (Array.isArray(churches) ? churches : []).filter(c => c && c.name).slice(0, GOAL);
  const ALL = Array.from({ length: GOAL }, (_, i) => listed[i]
    ? { ...listed[i], n: i + 1, year: String(listed[i].year || "") }
    : { n: i + 1, open: true });
  const photo = c => c.open || !c.photo ? PLACEHOLDERS[c.n % 2 ? 0 : 1] : c.photo;

  $("#done").textContent = listed.length;

  /* year filters, built from the years actually used */
  const years = [...new Set(listed.map(c => String(c.year)).filter(Boolean))].sort();
  const filters = $("#filters"), openChip = filters.querySelector('[data-f="open"]');
  years.forEach(y => {
    const b = document.createElement("button");
    b.className = "chip"; b.dataset.f = y; b.setAttribute("aria-pressed", "false"); b.textContent = y;
    filters.insertBefore(b, openChip);
  });

  const grid = $("#grid"), ticks = $("#ticks");
  ALL.forEach(c => {
    const t = document.createElement("span"); if (!c.open) t.className = "on"; ticks.appendChild(t);
    const li = document.createElement("li"); li.className = "slot"; li.dataset.year = c.open ? "open" : c.year;
    const label = c.open ? `Church plant ${c.n}, still to go` : `Church plant ${c.n}: ${c.name}, ${c.place}, ${c.year}`;
    li.innerHTML = `
      <button class="card${c.open ? " open" : ""}" data-n="${c.n}" aria-label="${esc(label)}" aria-haspopup="dialog">
        <div class="ph"><img src="${esc(photo(c))}" alt="" loading="lazy" decoding="async"><span class="num">${c.n}</span></div>
        <div class="cap">${c.open ? "&nbsp;" : `${esc(c.name)}, ${esc(c.place)} | <b>${esc(c.year)}</b>`}</div>
      </button>
      <div class="tip" aria-hidden="true">${c.open
        ? `<strong>Church Plant ${c.n}</strong><span>Still to go before 2027</span>`
        : `<strong>${esc(c.name)}</strong><span>${esc(c.place)} · ${esc(c.year)}</span><span class="go">Click to read the story</span>`}</div>`;
    grid.appendChild(li);
  });

  if (matchMedia("(hover:hover) and (pointer:fine)").matches) $("#hint").textContent = "Hover a church to preview. Click to read its story.";

  /* filters */
  filters.querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => {
    const f = b.dataset.f;
    filters.querySelectorAll(".chip").forEach(x => x.setAttribute("aria-pressed", x === b));
    grid.querySelectorAll(".slot").forEach(li => {
      const show = f === "all" || li.dataset.year === f;
      li.classList.toggle("dim", !show);
      li.querySelector(".card").tabIndex = show ? 0 : -1;
    });
  }));

  /* dialog */
  const dlg = $("#dlg"); let cur = 1;
  function render(n) {
    cur = n; const c = ALL[n - 1]; const src = photo(c);
    $("#d-img").src = src;
    $("#d-img").style.objectPosition = "50% " + (c.photoFocus || "50%");
    $("#d-bg").style.backgroundImage = `url("${src}")`;
    $("#d-img").alt = c.open ? "" : `${c.name} in ${c.place}`;
    $("#d-photo").className = "sheet-photo" + (c.open ? " open-slot" : "");
    $("#d-kicker").textContent = `Church Plant ${n}:`;
    if (c.open) {
      $("#d-title").textContent = "Still to go";
      $("#d-meta").innerHTML = `<span>Target 2027</span>`;
      $("#d-story").textContent = `This spot on the wall is waiting for church plant ${n} of ${GOAL}. As new plants are catalyzed in least-reached places, their stories will be added here.`;
      $("#d-story").className = "story";
    } else {
      $("#d-title").textContent = c.name;
      $("#d-meta").innerHTML = `<span>${esc(c.place)}</span><span class="y">${esc(c.year)}</span>`;
      $("#d-story").textContent = c.story || "Full story coming soon.";
      $("#d-story").className = "story" + (c.story ? "" : " soon");
    }
    $("#d-pos").textContent = `${n} of ${GOAL}`; $("#sheet").scrollTop = 0;
    $("#d-prev").disabled = n === 1; $("#d-next").disabled = n === GOAL;
  }
  function open(n) { render(n); if (!dlg.open) dlg.showModal(); const s = $("#sheet"); s.scrollTop = 0; requestAnimationFrame(() => { s.scrollTop = 0; }); }
  grid.addEventListener("click", e => { const b = e.target.closest(".card"); if (b) open(+b.dataset.n); });
  $("#d-close").onclick = () => dlg.close();
  $("#d-prev").onclick = () => cur > 1 && render(cur - 1);
  $("#d-next").onclick = () => cur < GOAL && render(cur + 1);
  $("#wrapper").addEventListener("click", e => { if (e.target.id === "wrapper") dlg.close(); });
  dlg.addEventListener("keydown", e => { if (e.key === "ArrowRight" && cur < GOAL) render(cur + 1); if (e.key === "ArrowLeft" && cur > 1) render(cur - 1); });
  dlg.addEventListener("close", () => { const b = grid.querySelector(`.card[data-n="${cur}"]`); b && b.focus({ preventScroll: true }); });
  let sx = null, sy = null;
  $("#sheet").addEventListener("touchstart", e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  $("#sheet").addEventListener("touchend", e => {
    if (sx === null) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { if (dx < 0 && cur < GOAL) render(cur + 1); if (dx > 0 && cur > 1) render(cur - 1); }
    sx = null;
  }, { passive: true });
})();
