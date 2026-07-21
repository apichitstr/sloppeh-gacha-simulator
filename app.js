const PRICE_PER_DRAW = 160;
const LEGENDARY_PITY_ROLLS = 150;
const EPIC_PITY_ROLLS = 10;
const BLISS_POINT_THRESHOLD_DRAWS = 131;
const BLISS_POINT_STEP = 20;
const BLISS_POINT_MAX = 100;
const BLISS_TRIGGER_REWARD = "Harmonic Core";
const BLISS_GUARANTEE_REWARD = "Starwoven Dreams";
const THB_PER_USD = 35;
const STORAGE_KEY = "gacha-simulator-celestial-web-v1";
const ANALYTICS_ENDPOINT = "https://script.google.com/macros/s/AKfycbzPKMXBtShuXZ23KBEiYSxJOb9HitbqHRV_KjvgBN4yodcXz5w0qSgMOTIhnsJBdFNU/exec";
const ANALYTICS_SESSION_KEY = "gacha-simulator-session-id";
const ANALYTICS_TIMEZONE = "Asia/Bangkok";

const TOPUP_PACKAGES = [
  { baht: 35, pearl: 60 },
  { baht: 100, pearl: 180 },
  { baht: 169, pearl: 330 },
  { baht: 335, pearl: 668 },
  { baht: 500, pearl: 1015 },
  { baht: 1000, pearl: 2068 },
  { baht: 1670, pearl: 3458 },
  { baht: 3350, pearl: 7200 },
  { baht: 6700, pearl: 14400 },
];

const INITIAL_REWARDS = [
  { name: "Harmonic Core", weight: 0.7470, rarity: "Legendary" },
  { name: "Starwoven Dreams", weight: 0.0415, rarity: "Legendary" },
  { name: "Exquisite Harmonic Core", weight: 0.0415, rarity: "Legendary" },
  { name: "Inkshade Hairdye", weight: 1.84, rarity: "Epic" },
  { name: "Twenty-Four Blossoms", weight: 1.84, rarity: "Epic" },
  { name: "Puppetry - Body Type I", weight: 1.84, rarity: "Epic" },
  { name: "Puppetry - Body Type II", weight: 1.84, rarity: "Epic" },
  { name: "Crane Porcelain Vase", weight: 1.84, rarity: "Epic" },
  { name: "Lone March - Hair", weight: 0.92, rarity: "Epic" },
  { name: "Lone March - Clothes", weight: 0.92, rarity: "Epic" },
  { name: "Swiftness Script x3", weight: 5.10899, rarity: "Rare" },
  { name: "Defense Script x3", weight: 5.10899, rarity: "Rare" },
  { name: "Restoration Script x3", weight: 5.10899, rarity: "Rare" },
  { name: "Fireburst: Gold", weight: 7.66348, rarity: "Rare" },
  { name: "Fireburst: White", weight: 7.66348, rarity: "Rare" },
  { name: "Peach Branch", weight: 12.77249, rarity: "Rare" },
  { name: "Crispy Pheasant x3", weight: 5.10899, rarity: "Rare" },
  { name: "Venison Soup x3", weight: 5.10899, rarity: "Rare" },
  { name: "Wound Balm x3", weight: 7.66348, rarity: "Rare" },
  { name: "Yin-Yang Ointment x3", weight: 7.66348, rarity: "Rare" },
  { name: "Message Horn: Near", weight: 5.10899, rarity: "Rare" },
  { name: "Message Horn: Far", weight: 1.27725, rarity: "Rare" },
  { name: "Softweave Dye Powder", weight: 12.77240, rarity: "Rare" },
];

const dom = {
  pearlBalance: document.getElementById("pearl-balance"),
  topupButton: document.getElementById("topup-button"),
  richToggle: document.getElementById("im-rich"),
  totalDraws: document.getElementById("total-draws"),
  legendaryCount: document.getElementById("legendary-count"),
  epicCount: document.getElementById("epic-count"),
  rareCount: document.getElementById("rare-count"),
  epicPity: document.getElementById("epic-pity"),
  legendaryPity: document.getElementById("legendary-pity"),
  totalCost: document.getElementById("total-cost"),
  topupTotal: document.getElementById("topup-total"),
  blissPoint: document.getElementById("bliss-point"),
  blissFill: document.getElementById("bliss-fill"),
  blissNote: document.getElementById("bliss-note"),
  lastResult: document.getElementById("last-result"),
  drawOne: document.getElementById("draw-one"),
  drawTen: document.getElementById("draw-ten"),
  drawFifty: document.getElementById("draw-fifty"),
  drawOnePrice: document.getElementById("draw-one-price"),
  drawTenPrice: document.getElementById("draw-ten-price"),
  drawFiftyPrice: document.getElementById("draw-fifty-price"),
  currencySelect: document.getElementById("currency-select"),
  resetButton: document.getElementById("reset-button"),
  historyLog: document.getElementById("history-log"),
  inventoryPanel: document.getElementById("inventory-panel"),
  topupModal: document.getElementById("topup-modal"),
  packageList: document.getElementById("package-list"),
  confirmTopup: document.getElementById("confirm-topup"),
  cancelTopup: document.getElementById("cancel-topup"),
  closeTopup: document.getElementById("close-topup"),
};

const state = defaultState();

const analytics = {
  sessionId: getOrCreateSessionId(),
};

function defaultState() {
  return {
    logEntries: [],
    drawCount: 0,
    inventory: Object.fromEntries(INITIAL_REWARDS.map((item) => [item.name, 0])),
    drawsSinceLegendary: 0,
    drawsSinceEpicOrBetter: 0,
    pearlBalance: 0,
    totalTopupBaht: 0,
    blissPoints: 0,
    currencyCode: "THB",
    imRich: false,
    lastResultText: "-",
    lastResultRarity: "",
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-US");
}

function formatMoney(thbValue) {
  if (state.currencyCode === "USD") {
    return `$${(thbValue / THB_PER_USD).toFixed(2)}`;
  }
  return `${formatNumber(thbValue)} THB`;
}

function randomToken(length = 10) {
  return Math.random().toString(36).slice(2, 2 + length);
}

function getOrCreateSessionId() {
  try {
    const existing = localStorage.getItem(ANALYTICS_SESSION_KEY);
    if (existing) {
      return existing;
    }
    const created = `${Date.now().toString(36)}-${randomToken(8)}`;
    localStorage.setItem(ANALYTICS_SESSION_KEY, created);
    return created;
  } catch {
    return `${Date.now().toString(36)}-${randomToken(8)}`;
  }
}

function formatEventTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: ANALYTICS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day} ${value.hour}:${value.minute}:${value.second} (${ANALYTICS_TIMEZONE})`;
}

function sendAnalyticsEvent(eventName, details = {}) {
  if (!ANALYTICS_ENDPOINT) {
    return;
  }

  const payload = {
    ts: formatEventTimestamp(),
    tsUtc: new Date().toISOString(),
    event: eventName,
    sessionId: analytics.sessionId,
    page: window.location.pathname,
    drawCount: state.drawCount,
    pearlBalance: state.pearlBalance,
    totalTopupBaht: state.totalTopupBaht,
    blissPoints: state.blissPoints,
    currencyCode: state.currencyCode,
    imRich: state.imRich,
    userAgent: navigator.userAgent,
    ...details,
  };

  const requestBody = JSON.stringify(payload);

  try {
    fetch(ANALYTICS_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: requestBody,
      keepalive: true,
    }).catch(() => {
      // ignore network failures to avoid impacting gameplay
    });
  } catch {
    // ignore network failures to avoid impacting gameplay
  }
}

function formatPackageLabel(packageInfo) {
  const primary = formatMoney(packageInfo.baht);
  const secondary = state.currencyCode === "USD"
    ? `${formatNumber(packageInfo.baht)} THB`
    : `$${(packageInfo.baht / THB_PER_USD).toFixed(2)}`;
  return `${primary} (${secondary}) -> ${formatNumber(packageInfo.pearl)} pearl`;
}

function rarityClass(rarity) {
  return rarity.toLowerCase();
}

function pushLog(text, className = "") {
  state.logEntries.push({ text, className });
}

function buildRewardPool(rarity) {
  return INITIAL_REWARDS.filter((item) => item.rarity === rarity);
}

function pickFromPool(pool) {
  if (!pool.length) {
    return null;
  }

  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) {
    return null;
  }

  const cursor = Math.random() * totalWeight;
  let running = 0;
  for (const item of pool) {
    running += item.weight;
    if (cursor <= running) {
      return item;
    }
  }
  return pool[pool.length - 1];
}

function weightedPick(forcedRarity = null) {
  if (!forcedRarity) {
    return pickFromPool(INITIAL_REWARDS);
  }
  return pickFromPool(buildRewardPool(forcedRarity));
}

function drawOnceWithPity() {
  const legendaryGuaranteed = state.drawsSinceLegendary >= LEGENDARY_PITY_ROLLS - 1;
  const epicGuaranteed = !legendaryGuaranteed && state.drawsSinceEpicOrBetter >= EPIC_PITY_ROLLS - 1;
  const blissGuaranteed = state.blissPoints >= BLISS_POINT_MAX;

  let forcedRarity = null;
  let guaranteeMark = "";
  let forcedRewardName = null;

  if (blissGuaranteed) {
    forcedRarity = "Legendary";
    forcedRewardName = BLISS_GUARANTEE_REWARD;
    guaranteeMark = "BLISS GUARANTEED";
  } else if (legendaryGuaranteed) {
    forcedRarity = "Legendary";
    guaranteeMark = "LEGENDARY GUARANTEED";
  } else if (epicGuaranteed) {
    forcedRarity = "Epic";
    guaranteeMark = "EPIC GUARANTEED";
  }

  const item = weightedPick(forcedRarity);
  if (!item) {
    return null;
  }

  const resolvedItem = forcedRewardName
    ? { ...item, name: forcedRewardName }
    : item;

  state.inventory[resolvedItem.name] += 1;
  if (resolvedItem.rarity === "Legendary") {
    state.drawsSinceLegendary = 0;
    state.drawsSinceEpicOrBetter = 0;
    if (blissGuaranteed) {
      state.blissPoints = 0;
    }
  } else if (resolvedItem.rarity === "Epic") {
    state.drawsSinceLegendary += 1;
    state.drawsSinceEpicOrBetter = 0;
  } else {
    state.drawsSinceLegendary += 1;
    state.drawsSinceEpicOrBetter += 1;
  }

  return { item: resolvedItem, guaranteeMark };
}

function updateBlissPoints(totalDraws, item) {
  if (totalDraws < BLISS_POINT_THRESHOLD_DRAWS || item.rarity !== "Legendary") {
    return;
  }

  if (item.name === BLISS_TRIGGER_REWARD) {
    state.blissPoints = Math.min(BLISS_POINT_MAX, state.blissPoints + BLISS_POINT_STEP);
    return;
  }

  state.blissPoints = 0;
}

function chooseFewestPackagePlan(shortfall) {
  const packages = TOPUP_PACKAGES.map((pkg, index) => ({ ...pkg, index }));
  const maxPearl = Math.max(...packages.map((pkg) => pkg.pearl));
  const minPacks = Math.ceil(shortfall / maxPearl);

  // For very large gaps, skip exhaustive search and keep the fewest-pack greedy plan.
  if (minPacks > 8) {
    const biggest = packages.reduce((best, current) => (current.pearl > best.pearl ? current : best));
    const qtyByIndex = new Array(packages.length).fill(0);
    if (shortfall % biggest.pearl === 0) {
      qtyByIndex[biggest.index] = minPacks;
    } else {
      qtyByIndex[biggest.index] = Math.max(0, minPacks - 1);
      const covered = qtyByIndex[biggest.index] * biggest.pearl;
      const remain = Math.max(0, shortfall - covered);
      const lastPack = [...packages]
        .filter((pkg) => pkg.pearl >= remain)
        .sort((a, b) => (a.pearl - b.pearl) || (a.baht - b.baht))[0] || biggest;
      qtyByIndex[lastPack.index] += 1;
    }

    return TOPUP_PACKAGES
      .map((pkg, index) => ({ ...pkg, qty: qtyByIndex[index] }))
      .filter((pkg) => pkg.qty > 0);
  }

  let best = null;
  const qtyByIndex = new Array(packages.length).fill(0);

  function dfs(step, totalPearl, totalBaht) {
    if (step === minPacks) {
      if (totalPearl < shortfall) {
        return;
      }

      const extra = totalPearl - shortfall;
      const candidate = {
        extra,
        baht: totalBaht,
        qtyByIndex: [...qtyByIndex],
      };

      if (!best || candidate.extra < best.extra || (candidate.extra === best.extra && candidate.baht < best.baht)) {
        best = candidate;
      }
      return;
    }

    // Prune when current best cannot be improved on overage.
    if (best && totalPearl - shortfall > best.extra) {
      return;
    }

    for (let i = 0; i < packages.length; i += 1) {
      const pkg = packages[i];
      qtyByIndex[pkg.index] += 1;
      dfs(step + 1, totalPearl + pkg.pearl, totalBaht + pkg.baht);
      qtyByIndex[pkg.index] -= 1;
    }
  }

  dfs(0, 0, 0);

  if (!best) {
    return [];
  }

  return TOPUP_PACKAGES
    .map((pkg, index) => ({ ...pkg, qty: best.qtyByIndex[index] }))
    .filter((pkg) => pkg.qty > 0);
}

function autoTopupForRichMode(shortfall) {
  if (shortfall <= 0) {
    return;
  }

  const selectedPurchases = chooseFewestPackagePlan(shortfall);
  if (!selectedPurchases.length) {
    return;
  }

  let totalBaht = 0;
  let totalPearl = 0;
  let totalPacks = 0;

  for (const purchase of selectedPurchases) {
    totalBaht += purchase.baht * purchase.qty;
    totalPearl += purchase.pearl * purchase.qty;
    totalPacks += purchase.qty;
  }

  state.totalTopupBaht += totalBaht;
  state.pearlBalance += totalPearl;
  pushLog(`--- I'M RICH AUTO TOP UP x${totalPacks}: ${formatMoney(totalBaht)} -> +${formatNumber(totalPearl)} pearl ---`, "header");
  pushLog("", "spacer");
}

function spendForDraws(count) {
  const needed = count * PRICE_PER_DRAW;
  if (state.imRich && state.pearlBalance < needed) {
    autoTopupForRichMode(needed - state.pearlBalance);
  }

  if (state.pearlBalance < needed) {
    window.alert(`Need ${formatNumber(needed)} pearl for ${count} draw(s). Current balance: ${formatNumber(state.pearlBalance)} pearl.`);
    return false;
  }

  state.pearlBalance -= needed;
  return true;
}

function drawMany(count) {
  if (!spendForDraws(count)) {
    return;
  }

  pushLog(`--- Draw ${count} ---`, "header");

  let lastItem = null;
  let legendaryCount = 0;
  let epicCount = 0;
  let rareCount = 0;
  for (let i = 0; i < count; i += 1) {
    const result = drawOnceWithPity();
    if (!result) {
      break;
    }

    state.drawCount += 1;
    updateBlissPoints(state.drawCount, result.item);
    lastItem = result.item;
    if (result.item.rarity === "Legendary") {
      legendaryCount += 1;
    } else if (result.item.rarity === "Epic") {
      epicCount += 1;
    } else {
      rareCount += 1;
    }
    const mark = result.guaranteeMark ? `  [${result.guaranteeMark}]` : "";
    pushLog(`#${String(state.drawCount).padStart(4, "0")}  [${result.item.rarity}]  ${result.item.name}${mark}`, rarityClass(result.item.rarity));
  }

  if (lastItem) {
    state.lastResultText = `[${lastItem.rarity}] ${lastItem.name}`;
    state.lastResultRarity = lastItem.rarity;
  }

  pushLog("", "spacer");
  renderAll();
  sendAnalyticsEvent("draw", {
    drawsRequested: count,
    legendaryInBatch: legendaryCount,
    epicInBatch: epicCount,
    rareInBatch: rareCount,
    lastResult: state.lastResultText,
    blissPointsAfter: state.blissPoints,
  });
}

function countByRarity(rarity) {
  return INITIAL_REWARDS.reduce((sum, item) => sum + (item.rarity === rarity ? state.inventory[item.name] : 0), 0);
}

function updatePearlBalanceSizing(textValue) {
  const length = String(textValue).length;
  dom.pearlBalance.classList.remove("pearl-size-md", "pearl-size-sm", "pearl-size-xs");

  if (length >= 15) {
    dom.pearlBalance.classList.add("pearl-size-xs");
  } else if (length >= 12) {
    dom.pearlBalance.classList.add("pearl-size-sm");
  } else if (length >= 9) {
    dom.pearlBalance.classList.add("pearl-size-md");
  }
}

function renderStatus() {
  const pearlText = formatNumber(state.pearlBalance);
  dom.pearlBalance.textContent = pearlText;
  updatePearlBalanceSizing(pearlText);
  dom.totalDraws.textContent = formatNumber(state.drawCount);
  dom.legendaryCount.textContent = formatNumber(countByRarity("Legendary"));
  dom.epicCount.textContent = formatNumber(countByRarity("Epic"));
  dom.rareCount.textContent = formatNumber(countByRarity("Rare"));
  dom.epicPity.textContent = `Epic pity: ${state.drawsSinceEpicOrBetter}/${EPIC_PITY_ROLLS} (in ${EPIC_PITY_ROLLS - state.drawsSinceEpicOrBetter} draw)`;
  dom.legendaryPity.textContent = `Legendary pity: ${state.drawsSinceLegendary}/${LEGENDARY_PITY_ROLLS} (in ${LEGENDARY_PITY_ROLLS - state.drawsSinceLegendary} draw)`;
  dom.totalCost.textContent = `Total cost: ${formatNumber(state.drawCount)} draw(s) x ${PRICE_PER_DRAW} = ${formatNumber(state.drawCount * PRICE_PER_DRAW)} pearl`;
  dom.topupTotal.textContent = `Top up: ${formatMoney(state.totalTopupBaht)}`;
  dom.blissPoint.textContent = `Bliss Point: ${formatNumber(state.blissPoints)}/100`;
  dom.blissFill.style.width = `${Math.max(0, Math.min(100, state.blissPoints))}%`;
  dom.blissNote.textContent = state.blissPoints >= BLISS_POINT_MAX
    ? `Bliss Privilege activated. The next Legendary reward will be ${BLISS_GUARANTEE_REWARD}.`
    : `After ${BLISS_POINT_THRESHOLD_DRAWS} total draws, Harmonic Core gives +${BLISS_POINT_STEP}%. At 100%, the next Legendary becomes ${BLISS_GUARANTEE_REWARD}.`;
  dom.lastResult.textContent = state.lastResultText;
  dom.lastResult.className = `last-result-value ${state.lastResultRarity ? `rarity-${state.lastResultRarity.toLowerCase()}` : ""}`;
}

function renderDrawPriceLabels() {
  dom.drawOnePrice.textContent = `${formatNumber(PRICE_PER_DRAW)} pearl`;
  dom.drawTenPrice.textContent = `${formatNumber(PRICE_PER_DRAW * 10)} pearl`;
  dom.drawFiftyPrice.textContent = `${formatNumber(PRICE_PER_DRAW * 50)} pearl`;
}

function renderHistory() {
  dom.historyLog.innerHTML = state.logEntries
    .map((entry) => {
      if (entry.className === "spacer") {
        return '<div class="log-line spacer"></div>';
      }
      const classes = ["log-line"];
      if (entry.className) {
        classes.push(entry.className);
      }
      return `<div class="${classes.join(" ")}">${escapeHtml(entry.text)}</div>`;
    })
    .join("");
  dom.historyLog.scrollTop = dom.historyLog.scrollHeight;
}

function renderInventory() {
  const groups = ["Legendary", "Epic", "Rare"];
  dom.inventoryPanel.innerHTML = groups
    .map((rarity) => {
      const rarityItems = INITIAL_REWARDS.filter((item) => item.rarity === rarity)
        .map((item) => ({ item, count: state.inventory[item.name] }))
        .filter(({ count }) => count > 0);

      const itemsMarkup = rarityItems.length
        ? rarityItems
            .map(({ item, count }) => `<div class="inventory-item ${rarity.toLowerCase()}">- ${escapeHtml(item.name)}: ${formatNumber(count)}</div>`)
            .join("")
        : '<div class="inventory-empty">- (none)</div>';

      return `<section class="inventory-group rarity-${rarity.toLowerCase()}"><h3>[${rarity}]</h3>${itemsMarkup}</section>`;
    })
    .join("");
}

function renderTopupModalRows() {
  const isMobileStepperMode = window.matchMedia("(pointer: coarse), (max-width: 820px)").matches;
  const mobileReadonlyAttr = isMobileStepperMode ? 'readonly inputmode="none"' : "";

  dom.packageList.innerHTML = TOPUP_PACKAGES.map(
    (pkg, index) => `
      <label class="package-row">
        <span class="package-name">${escapeHtml(formatPackageLabel(pkg))}</span>
        <div class="qty-stepper" role="group" aria-label="Quantity controls">
          <button
            type="button"
            class="qty-arrow"
            data-step="down"
            data-package-index="${index}"
            aria-label="Decrease package quantity"
          >
            ▼
          </button>
          <input
            type="number"
            min="0"
            max="99"
            value="0"
            data-package-index="${index}"
            ${mobileReadonlyAttr}
          />
          <button
            type="button"
            class="qty-arrow"
            data-step="up"
            data-package-index="${index}"
            aria-label="Increase package quantity"
          >
            ▲
          </button>
        </div>
      </label>
    `,
  ).join("");
}

function adjustPackageQty(index, direction) {
  const input = dom.packageList.querySelector(`input[data-package-index="${index}"]`);
  if (!input) {
    return;
  }

  const current = Number(input.value) || 0;
  const delta = direction === "up" ? 1 : -1;
  const next = Math.max(0, Math.min(99, current + delta));
  input.value = String(next);
}

function openTopupModal() {
  renderTopupModalRows();
  dom.topupModal.classList.remove("hidden");
}

function closeTopupModal() {
  dom.topupModal.classList.add("hidden");
}

function confirmTopup() {
  const inputs = [...dom.packageList.querySelectorAll('input[type="number"]')];
  let totalBaht = 0;
  let totalPearl = 0;
  let totalPacks = 0;

  inputs.forEach((input) => {
    const index = Number(input.dataset.packageIndex);
    const qty = Number(input.value) || 0;
    if (qty <= 0) {
      return;
    }

    const packageInfo = TOPUP_PACKAGES[index];
    totalBaht += packageInfo.baht * qty;
    totalPearl += packageInfo.pearl * qty;
    totalPacks += qty;
  });

  if (totalPearl <= 0) {
    window.alert("Please select at least 1 package.");
    return;
  }

  state.totalTopupBaht += totalBaht;
  state.pearlBalance += totalPearl;
  pushLog(`--- TOP UP x${totalPacks}: ${formatMoney(totalBaht)} -> +${formatNumber(totalPearl)} pearl ---`, "header");
  pushLog("", "spacer");
  closeTopupModal();
  renderAll();
  sendAnalyticsEvent("topup", {
    packs: totalPacks,
    topupBaht: totalBaht,
    topupPearl: totalPearl,
  });
}

function resetState() {
  const keepRich = state.imRich;
  Object.assign(state, defaultState());
  state.imRich = keepRich;
  dom.richToggle.checked = keepRich;
  saveState();
  renderAll();
  sendAnalyticsEvent("reset", { reason: "manual" });
}

function renderAll() {
  renderStatus();
  renderDrawPriceLabels();
  renderHistory();
  renderInventory();
  saveState();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage failures in private mode
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    Object.assign(state, defaultState(), parsed);
    state.inventory = { ...defaultState().inventory, ...(parsed.inventory || {}) };
    state.logEntries = Array.isArray(parsed.logEntries) ? parsed.logEntries : [];
    state.drawCount = Number(parsed.drawCount) || 0;
    state.drawsSinceLegendary = Number(parsed.drawsSinceLegendary) || 0;
    state.drawsSinceEpicOrBetter = Number(parsed.drawsSinceEpicOrBetter) || 0;
    state.pearlBalance = Number(parsed.pearlBalance) || 0;
    state.totalTopupBaht = Number(parsed.totalTopupBaht) || 0;
    state.blissPoints = Math.max(0, Math.min(BLISS_POINT_MAX, Number(parsed.blissPoints) || 0));
    state.currencyCode = parsed.currencyCode === "USD" ? "USD" : "THB";
    state.imRich = Boolean(parsed.imRich);
    state.lastResultText = parsed.lastResultText || "-";
    state.lastResultRarity = parsed.lastResultRarity || "";
  } catch {
    // ignore malformed storage content
  }
}

function setCurrency(code) {
  state.currencyCode = code === "USD" ? "USD" : "THB";
  renderAll();
  sendAnalyticsEvent("currency_change", { currencyCode: state.currencyCode });
}

function bindEvents() {
  dom.drawOne.addEventListener("click", () => drawMany(1));
  dom.drawTen.addEventListener("click", () => drawMany(10));
  dom.drawFifty.addEventListener("click", () => drawMany(50));
  dom.topupButton.addEventListener("click", openTopupModal);
  dom.confirmTopup.addEventListener("click", confirmTopup);
  dom.cancelTopup.addEventListener("click", closeTopupModal);
  dom.closeTopup.addEventListener("click", closeTopupModal);
  dom.resetButton.addEventListener("click", () => {
    const confirmed = window.confirm("Reset all progress, inventory, and pearl balance?");
    if (!confirmed) {
      return;
    }
    resetState();
  });
  dom.currencySelect.addEventListener("change", (event) => setCurrency(event.target.value));
  dom.richToggle.addEventListener("change", (event) => {
    state.imRich = event.target.checked;
    saveState();
    sendAnalyticsEvent("rich_toggle", { enabled: state.imRich });
  });

  dom.packageList.addEventListener("click", (event) => {
    const arrow = event.target.closest(".qty-arrow");
    if (!arrow) {
      return;
    }

    const index = Number(arrow.dataset.packageIndex);
    const direction = arrow.dataset.step;
    adjustPackageQty(index, direction);
  });

  dom.topupModal.addEventListener("click", (event) => {
    if (event.target === dom.topupModal) {
      closeTopupModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dom.topupModal.classList.contains("hidden")) {
      closeTopupModal();
    }
  });
}

function init() {
  loadState();
  dom.currencySelect.value = state.currencyCode;
  dom.richToggle.checked = state.imRich;
  bindEvents();
  renderAll();
  sendAnalyticsEvent("session_start", { referrer: document.referrer || "" });
}

init();
