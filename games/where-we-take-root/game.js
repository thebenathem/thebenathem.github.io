const STORAGE_KEY = "wwtr-garden-v1";
const ROWS = 5;
const COLS = 6;
const PLOT_COUNT = ROWS * COLS;

const SPECIES = {
  tomato: {
    name: "Tomato",
    subtitle: "Human archive",
    css: "tomato",
    moisture: [2, 4],
    maxStage: 5,
    growthNeed: 2,
    note: "Likes steady moisture and space for its roots.",
  },
  "new-pine": {
    name: "New Pine",
    subtitle: "Human archive",
    css: "new-pine",
    moisture: [1, 3],
    maxStage: 5,
    growthNeed: 3,
    note: "Patient, resilient, and easily overwatered.",
  },
  "nitrogen-fern": {
    name: "Nitrogen Fern",
    subtitle: "Human archive",
    css: "nitrogen-fern",
    moisture: [2, 4],
    maxStage: 4,
    growthNeed: 2,
    note: "Tolerates company; prefers damp rather than saturated soil.",
  },
  "climbing-moss": {
    name: "Climbing Moss",
    subtitle: "Human archive",
    css: "climbing-moss",
    moisture: [3, 5],
    maxStage: 4,
    growthNeed: 1,
    note: "Thrives in humid corners. Karu believed encouragement helped.",
  },
  "ground-vine": {
    name: "Vaeren Ground Vine",
    subtitle: "Wayfarer stores",
    css: "ground-vine",
    moisture: [1, 3],
    maxStage: 4,
    growthNeed: 2,
    note: "Responsive roots. Does not behave like a human crop.",
  },
  "silver-bark": {
    name: "Silver-bark",
    subtitle: "Vaeren nursery",
    css: "silver-bark",
    moisture: [1, 3],
    maxStage: 5,
    growthNeed: 3,
    note: "A native tree that makes room rather than simply competing.",
  },
};

const DISCOVERIES = [
  {
    id: "vine-tomato",
    title: "Different needs can share one bed",
    text: "The Vaeren ground vine folds its roots away when the tomato irrigation opens, then extends again after the excess drains.",
  },
  {
    id: "pine-silverbark",
    title: "Accommodation, not competition",
    text: "New Pine roots bend deeper while silver-bark roots move toward the surface. Neither needs to dominate the other.",
  },
  {
    id: "moss-patience",
    title: "Not every thirst is urgent",
    text: "Climbing moss can look quiet before responding. Repeated intervention is less useful than watching the moisture settle.",
  },
  {
    id: "mixed-garden",
    title: "Knowledge works better together",
    text: "A mixed Human–Vaeren planting can thrive once you stop expecting every species to want the same conditions.",
  },
  {
    id: "leave-alone",
    title: "Listening includes restraint",
    text: "A garden in balance does not need to be constantly corrected. Sometimes the useful action is to leave it alone.",
  },
];

const defaultState = () => ({
  cycle: 1,
  selected: { type: "plant", value: "tomato" },
  plots: Array.from({ length: PLOT_COUNT }, () => ({
    species: null,
    moisture: 2,
    stage: 0,
    growth: 0,
    stress: 0,
    listened: false,
    lastWatered: 0,
  })),
  discoveries: [],
  log: ["The nursery is ready. Choose what to plant."],
  noActionCycles: 0,
});

let state = loadState();
let toastTimer;

const gardenEl = document.getElementById("garden");
const seedListEl = document.getElementById("seed-list");
const dayLabelEl = document.getElementById("day-label");
const selectionHelpEl = document.getElementById("selection-help");
const readingEl = document.getElementById("resonance-reading");
const resonanceOrbEl = document.getElementById("resonance-orb");
const logEl = document.getElementById("observation-log");
const discoveryListEl = document.getElementById("discovery-list");
const discoveryCountEl = document.getElementById("discovery-count");
const toastEl = document.getElementById("toast");

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultState();
    const parsed = JSON.parse(saved);
    if (!parsed || !Array.isArray(parsed.plots) || parsed.plots.length !== PLOT_COUNT) {
      return defaultState();
    }
    return {
      ...defaultState(),
      ...parsed,
      plots: parsed.plots.map((plot) => ({
        species: null,
        moisture: 2,
        stage: 0,
        growth: 0,
        stress: 0,
        listened: false,
        lastWatered: 0,
        ...plot,
      })),
      discoveries: Array.isArray(parsed.discoveries) ? parsed.discoveries : [],
      log: Array.isArray(parsed.log) ? parsed.log.slice(0, 6) : [],
    };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function addLog(message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 6);
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2100);
}

function indexToCoords(index) {
  return { row: Math.floor(index / COLS), col: index % COLS };
}

function getNeighborIndexes(index) {
  const { row, col } = indexToCoords(index);
  const candidates = [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];
  return candidates
    .filter(([r, c]) => r >= 0 && r < ROWS && c >= 0 && c < COLS)
    .map(([r, c]) => r * COLS + c);
}

function hasNeighbor(index, speciesId) {
  return getNeighborIndexes(index).some((neighborIndex) => state.plots[neighborIndex].species === speciesId);
}

function adjacentPair(a, b) {
  return state.plots.some((plot, index) => {
    if (plot.species !== a) return false;
    return hasNeighbor(index, b);
  });
}

function createPlantArt(speciesId, stage = 1) {
  const art = document.createElement("div");
  const species = SPECIES[speciesId];
  art.className = `plant-art ${species.css} stage-${Math.max(1, stage)}`;
  const detail = document.createElement("span");
  art.appendChild(detail);
  return art;
}

function renderSeeds() {
  seedListEl.innerHTML = "";
  Object.entries(SPECIES).forEach(([id, species]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "seed-card";
    button.dataset.species = id;
    button.setAttribute("aria-pressed", String(state.selected.type === "plant" && state.selected.value === id));
    if (state.selected.type === "plant" && state.selected.value === id) button.classList.add("selected");

    const preview = document.createElement("span");
    preview.className = "seed-preview";
    preview.appendChild(createPlantArt(id, 4));

    const text = document.createElement("span");
    const strong = document.createElement("strong");
    strong.textContent = species.name;
    const small = document.createElement("small");
    small.textContent = species.subtitle;
    text.append(strong, small);

    button.append(preview, text);
    button.addEventListener("click", () => selectPlant(id));
    seedListEl.appendChild(button);
  });
}

function renderTools() {
  document.querySelectorAll("[data-tool]").forEach((button) => {
    const tool = button.dataset.tool;
    const selected = state.selected.type === "tool" && state.selected.value === tool;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function renderGarden() {
  gardenEl.innerHTML = "";
  state.plots.forEach((plot, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "plot";
    button.setAttribute("role", "gridcell");
    const { row, col } = indexToCoords(index);
    button.dataset.index = index;

    if (plot.moisture >= 4) button.classList.add("wet");
    if (plot.moisture <= 0) button.classList.add("dry");
    if (plot.stress >= 2) button.classList.add("stressed");
    if (plot.species && plot.stress === 0 && plot.stage >= 3) button.classList.add("thriving");
    if (plot.listened) button.classList.add("listened");

    const moisture = document.createElement("span");
    moisture.className = "moisture-mark";
    button.appendChild(moisture);

    if (plot.species && SPECIES[plot.species]) {
      const species = SPECIES[plot.species];
      button.appendChild(createPlantArt(plot.species, plot.stage));
      button.setAttribute(
        "aria-label",
        `Row ${row + 1}, column ${col + 1}: ${species.name}, growth stage ${plot.stage} of ${species.maxStage}`
      );
      button.title = `${species.name} · stage ${plot.stage}/${species.maxStage}`;
    } else {
      button.setAttribute("aria-label", `Row ${row + 1}, column ${col + 1}: empty bed`);
      button.title = "Empty bed";
    }

    button.addEventListener("click", () => actOnPlot(index));
    gardenEl.appendChild(button);
  });
}

function renderReadout() {
  dayLabelEl.textContent = `Cycle ${state.cycle}`;
  const score = calculateGardenScore();
  resonanceOrbEl.className = `resonance-orb level-${score.level}`;
  readingEl.textContent = score.text;

  if (state.selected.type === "plant") {
    selectionHelpEl.textContent = `Planting ${SPECIES[state.selected.value].name}. Choose an empty bed.`;
  } else if (state.selected.value === "water") {
    selectionHelpEl.textContent = "Water selected. Choose a bed that needs moisture.";
  } else if (state.selected.value === "remove") {
    selectionHelpEl.textContent = "Lift selected. Choose a planted bed to clear it.";
  } else {
    selectionHelpEl.textContent = "Listen selected. Choose a living bed to notice what it needs.";
  }

  logEl.innerHTML = "";
  state.log.forEach((entry) => {
    const p = document.createElement("p");
    p.className = "log-entry";
    p.textContent = entry;
    logEl.appendChild(p);
  });

  discoveryCountEl.textContent = `${state.discoveries.length} / ${DISCOVERIES.length}`;
  discoveryListEl.innerHTML = "";
  DISCOVERIES.forEach((discovery) => {
    const found = state.discoveries.includes(discovery.id);
    const item = document.createElement("div");
    item.className = `discovery${found ? " found" : ""}`;
    if (found) {
      const strong = document.createElement("strong");
      strong.textContent = discovery.title;
      const detail = document.createElement("div");
      detail.textContent = discovery.text;
      item.append(strong, detail);
    } else {
      const lock = document.createElement("span");
      lock.className = "lock";
      lock.textContent = "Not yet understood";
      item.appendChild(lock);
    }
    discoveryListEl.appendChild(item);
  });
}

function render() {
  renderSeeds();
  renderTools();
  renderGarden();
  renderReadout();
  saveState();
}

function selectPlant(id) {
  state.selected = { type: "plant", value: id };
  render();
}

function selectTool(tool) {
  state.selected = { type: "tool", value: tool };
  render();
}

function actOnPlot(index) {
  if (state.selected.type === "plant") {
    plantPlot(index, state.selected.value);
    return;
  }

  if (state.selected.value === "water") waterPlot(index);
  if (state.selected.value === "remove") removePlot(index);
  if (state.selected.value === "listen") listenPlot(index);
}

function plantPlot(index, speciesId) {
  const plot = state.plots[index];
  if (plot.species) {
    showToast("Something is already growing there.");
    return;
  }
  plot.species = speciesId;
  plot.stage = 1;
  plot.growth = 0;
  plot.stress = 0;
  plot.listened = false;
  plot.moisture = 2;
  state.noActionCycles = 0;
  addLog(`${SPECIES[speciesId].name} takes root in a new bed.`);
  evaluateDiscoveries("plant");
  render();
}

function waterPlot(index) {
  const plot = state.plots[index];
  plot.moisture = Math.min(5, plot.moisture + 2);
  plot.lastWatered = state.cycle;
  plot.listened = false;
  state.noActionCycles = 0;
  if (plot.species) {
    addLog(`Water settles around the ${SPECIES[plot.species].name.toLowerCase()}.`);
  } else {
    addLog("Water darkens an empty bed.");
  }
  evaluateDiscoveries("water", index);
  render();
}

function removePlot(index) {
  const plot = state.plots[index];
  if (!plot.species) {
    showToast("That bed is already empty.");
    return;
  }
  const name = SPECIES[plot.species].name;
  state.plots[index] = {
    species: null,
    moisture: plot.moisture,
    stage: 0,
    growth: 0,
    stress: 0,
    listened: false,
    lastWatered: plot.lastWatered,
  };
  state.noActionCycles = 0;
  addLog(`${name} is lifted carefully from the bed.`);
  render();
}

function listenPlot(index) {
  const plot = state.plots[index];
  if (!plot.species) {
    addLog("The empty soil holds moisture and little else.");
    render();
    return;
  }

  plot.listened = true;
  const species = SPECIES[plot.species];
  const observations = [];

  if (plot.moisture < species.moisture[0]) observations.push("The soil is drier than this plant prefers.");
  else if (plot.moisture > species.moisture[1]) observations.push("Water is lingering around the roots.");
  else observations.push("The moisture here feels settled.");

  if (plot.stress >= 2) observations.push("There is a persistent strain in the plant.");
  else if (plot.stage >= 3) observations.push("Its growth feels steady rather than urgent.");
  else observations.push("It is still learning the bed.");

  if (plot.species === "ground-vine" && hasNeighbor(index, "tomato")) {
    observations.push("Its roots keep changing course beside the human crop.");
  }
  if (plot.species === "new-pine" && hasNeighbor(index, "silver-bark")) {
    observations.push("The roots are not fighting for the same space.");
  }
  if (plot.species === "silver-bark" && hasNeighbor(index, "new-pine")) {
    observations.push("Its upper roots are shifting away from the Pine's fungal layer.");
  }

  addLog(`${species.name}: ${observations.join(" ")}`);
  evaluateDiscoveries("listen", index);
  render();
}

function growthHealth(plot, index) {
  if (!plot.species) return { healthy: false, stress: 0 };
  const species = SPECIES[plot.species];
  let stress = 0;
  if (plot.moisture < species.moisture[0]) stress += 1;
  if (plot.moisture > species.moisture[1]) stress += 1;

  if (plot.species === "tomato" && hasNeighbor(index, "ground-vine")) {
    stress = Math.max(0, stress - 1);
  }
  if (plot.species === "ground-vine" && hasNeighbor(index, "tomato")) {
    stress = Math.max(0, stress - 1);
  }
  if (plot.species === "new-pine" && hasNeighbor(index, "silver-bark")) {
    stress = Math.max(0, stress - 1);
  }
  if (plot.species === "silver-bark" && hasNeighbor(index, "new-pine")) {
    stress = Math.max(0, stress - 1);
  }
  if (plot.species === "climbing-moss" && plot.moisture === 2) {
    stress = Math.max(0, stress - 1);
  }

  return { healthy: stress === 0, stress };
}

function advanceCycle() {
  const plantedBefore = state.plots.filter((plot) => plot.species).length;
  if (plantedBefore === 0) {
    state.cycle += 1;
    state.noActionCycles += 1;
    addLog("The empty beds wait. Nothing asks to be hurried.");
    evaluateDiscoveries("cycle");
    render();
    return;
  }

  let grew = 0;
  let strained = 0;

  state.plots.forEach((plot, index) => {
    if (!plot.species) {
      plot.moisture = Math.max(0, plot.moisture - 1);
      return;
    }

    const species = SPECIES[plot.species];
    const health = growthHealth(plot, index);
    plot.stress = health.stress;
    plot.listened = false;

    if (health.healthy) {
      plot.growth += 1;
      if (plot.growth >= species.growthNeed && plot.stage < species.maxStage) {
        plot.stage += 1;
        plot.growth = 0;
        grew += 1;
      }
    } else {
      strained += 1;
      plot.growth = Math.max(0, plot.growth - 1);
    }

    const evaporation = plot.species === "climbing-moss" ? 0 : 1;
    plot.moisture = Math.max(0, plot.moisture - evaporation);
  });

  state.cycle += 1;
  state.noActionCycles += 1;

  if (grew > 0 && strained === 0) {
    addLog(`${grew === 1 ? "One plant opens into new growth" : `${grew} plants open into new growth`}. The nursery feels settled.`);
  } else if (grew > 0) {
    addLog(`New growth appears in ${grew} ${grew === 1 ? "bed" : "beds"}, while ${strained} ${strained === 1 ? "plant remains" : "plants remain"} under strain.`);
  } else if (strained > 0) {
    addLog(`${strained === 1 ? "One plant is" : `${strained} plants are`} asking for closer attention.`);
  } else {
    addLog("The garden changes almost invisibly. Growth does not always announce itself.");
  }

  evaluateDiscoveries("cycle");
  render();
}

function calculateGardenScore() {
  const planted = state.plots
    .map((plot, index) => ({ plot, index }))
    .filter(({ plot }) => plot.species);

  if (planted.length === 0) {
    return { level: 1, text: "The garden is quiet. Nothing has taken root yet." };
  }

  let healthy = 0;
  let stress = 0;
  let mature = 0;
  planted.forEach(({ plot, index }) => {
    const result = growthHealth(plot, index);
    if (result.healthy) healthy += 1;
    stress += result.stress;
    if (plot.stage >= 3) mature += 1;
  });

  const diversity = new Set(planted.map(({ plot }) => plot.species)).size;
  const relationshipBonus =
    (adjacentPair("tomato", "ground-vine") ? 2 : 0) +
    (adjacentPair("new-pine", "silver-bark") ? 2 : 0);
  const raw = healthy * 2 + mature + diversity + relationshipBonus - stress * 2;

  let level = 2;
  if (raw <= 3) level = 1;
  else if (raw <= 9) level = 2;
  else if (raw <= 17) level = 3;
  else if (raw <= 26) level = 4;
  else level = 5;

  const texts = {
    1: "There is strain here. Not catastrophe—just several needs speaking at once.",
    2: "The garden is unsettled, but alive. Some needs are beginning to become legible.",
    3: "Several living rhythms are beginning to hold beside one another.",
    4: "The garden feels balanced without becoming uniform. Different needs are making room for one another.",
    5: "A clear harmony moves through the nursery. Nothing has become the same; it has simply learned how to live beside what differs.",
  };
  return { level, text: texts[level] };
}

function discover(id) {
  if (state.discoveries.includes(id)) return;
  state.discoveries.push(id);
  const discovery = DISCOVERIES.find((item) => item.id === id);
  if (discovery) {
    addLog(`Understood: ${discovery.title}.`);
    showToast(`Relationship understood: ${discovery.title}`);
  }
}

function evaluateDiscoveries(action, index = null) {
  if (adjacentPair("tomato", "ground-vine")) {
    const pairHasAdvanced = state.plots.some((plot, plotIndex) =>
      ["tomato", "ground-vine"].includes(plot.species) && plot.stage >= 2 &&
      getNeighborIndexes(plotIndex).some((neighbor) => ["tomato", "ground-vine"].includes(state.plots[neighbor].species) && state.plots[neighbor].species !== plot.species)
    );
    if (pairHasAdvanced || action === "listen") discover("vine-tomato");
  }

  if (adjacentPair("new-pine", "silver-bark")) {
    const pairListened = index !== null && ["new-pine", "silver-bark"].includes(state.plots[index]?.species) && action === "listen";
    const pairMature = state.plots.some((plot, plotIndex) =>
      ["new-pine", "silver-bark"].includes(plot.species) && plot.stage >= 3 &&
      getNeighborIndexes(plotIndex).some((neighbor) => ["new-pine", "silver-bark"].includes(state.plots[neighbor].species) && state.plots[neighbor].species !== plot.species)
    );
    if (pairListened || pairMature) discover("pine-silverbark");
  }

  const moss = state.plots.find((plot) => plot.species === "climbing-moss");
  if (moss && state.cycle >= 3 && moss.stage >= 2 && moss.moisture >= 2 && moss.moisture <= 4) {
    discover("moss-patience");
  }

  const speciesCount = new Set(state.plots.filter((plot) => plot.species).map((plot) => plot.species)).size;
  const healthyCount = state.plots.filter((plot, plotIndex) => plot.species && growthHealth(plot, plotIndex).healthy).length;
  if (speciesCount >= 4 && healthyCount >= 4) discover("mixed-garden");

  const plantedCount = state.plots.filter((plot) => plot.species).length;
  if (action === "cycle" && state.noActionCycles >= 2 && plantedCount >= 3 && calculateGardenScore().level >= 3) {
    discover("leave-alone");
  }
}

function resetGame() {
  const confirmed = window.confirm("Start the garden again? This will clear the saved nursery on this browser.");
  if (!confirmed) return;
  state = defaultState();
  saveState();
  render();
  showToast("The nursery has been cleared.");
}

document.querySelectorAll("[data-tool]").forEach((button) => {
  button.addEventListener("click", () => selectTool(button.dataset.tool));
});

document.getElementById("advance-day").addEventListener("click", advanceCycle);
document.getElementById("reset-game").addEventListener("click", resetGame);

render();
