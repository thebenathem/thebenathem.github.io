/* Growth-stage logic override for Keep Something Growing.
   Keeps the existing game intact and changes only plant lifecycle behaviour. */

const GROWTH_STAGE_NAMES = ["", "Seed", "Sprout", "Sapling", "Mature", "Thriving"];

Object.values(SPECIES).forEach((species) => {
  species.maxStage = 5;
});

state.plots.forEach((plot) => {
  if (!plot.species) return;
  if (typeof plot.plantedCycle !== "number") {
    plot.plantedCycle = Math.max(1, state.cycle - Math.max(1, plot.stage || 1));
  }
});

plantPlot = function plantPlotWithStages(index, speciesId) {
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
  plot.lastWatered = 0;
  plot.plantedCycle = state.cycle;
  state.noActionCycles = 0;

  addLog(`${SPECIES[speciesId].name} seed is pressed into a new bed.`);
  evaluateDiscoveries("plant");
  render();
};

const originalAdvanceCycleHandler = advanceCycle;

advanceCycle = function advanceCycleWithStages() {
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
  let waitingForWater = 0;

  state.plots.forEach((plot, index) => {
    if (!plot.species) {
      plot.moisture = Math.max(0, plot.moisture - 1);
      return;
    }

    const species = SPECIES[plot.species];
    const health = growthHealth(plot, index);
    plot.stress = health.stress;
    plot.listened = false;

    const plantedCycle = typeof plot.plantedCycle === "number" ? plot.plantedCycle : state.cycle;
    const hasBeenWatered = plot.lastWatered >= plantedCycle;

    if (!hasBeenWatered && plot.stage < species.maxStage) {
      waitingForWater += 1;
      plot.growth = 0;
    } else if (health.healthy) {
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

  if (grew > 0 && strained === 0 && waitingForWater === 0) {
    addLog(`${grew === 1 ? "One plant opens into new growth" : `${grew} plants open into new growth`}. The nursery feels settled.`);
  } else if (grew > 0) {
    const notes = [];
    if (strained > 0) notes.push(`${strained} ${strained === 1 ? "plant remains" : "plants remain"} under strain`);
    if (waitingForWater > 0) notes.push(`${waitingForWater} ${waitingForWater === 1 ? "seed or plant is" : "seeds or plants are"} still waiting for water`);
    addLog(`New growth appears in ${grew} ${grew === 1 ? "bed" : "beds"}, while ${notes.join(" and ")}.`);
  } else if (waitingForWater > 0 && strained === 0) {
    addLog(`${waitingForWater === 1 ? "One planted bed is" : `${waitingForWater} planted beds are`} still waiting for water before growth can begin.`);
  } else if (strained > 0) {
    addLog(`${strained === 1 ? "One plant is" : `${strained} plants are`} asking for closer attention.`);
  } else {
    addLog("The garden changes almost invisibly. Growth does not always announce itself.");
  }

  evaluateDiscoveries("cycle");
  render();
};

const advanceButton = document.getElementById("advance-day");
advanceButton.removeEventListener("click", originalAdvanceCycleHandler);
advanceButton.addEventListener("click", advanceCycle);

render();
