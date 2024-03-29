/* eslint-disable max-lines-per-function */
const Patch = require('./patch');
const nextId = require("./next-id");

class Plot {
  constructor(name, length, width) {
    this.id = nextId();
    this.name = name;
    this.rows = Number(width);
    this.cols = Number(length);
    this.patchesToPlant = [];
    this.stagedPlant = undefined;
    this.infoPlant = undefined;
    this.createPatches();
  }

  getSelectedPatches() {
    return this.patchesToPlant;
  }

  hasPatchesToPlant() {
    return this.getSelectedPatches().length !== 0;
  }

  clearPatchesToPlant() {
    this.patchesToPlant = [];
  }

  addPatchToPlant(patch) {
    this.getSelectedPatches().push(patch);
  }

  deletePatchToPlant(patch) {
    let patchIndex = this.getSelectedPatches().indexOf(patch);
    this.getSelectedPatches().splice(patchIndex, 1);
  }

  createPatches() {
    this.patches = [];

    for (let row = 0; row < this.getRows(); row += 1) {
      this.addRow(row);
    }
  }

  addRow(row) {
    this.patches.push([]);
    for (let col = 0; col < this.getCols(); col += 1) {
      this.addPatch(row, col);
    }
  }

  isPatchToPlant(patch) {
    return this.getSelectedPatches().includes(patch);
  }

  getPatch(patchId) {
    for (let row of this.getPatches()) {
      for (let patch of row) {
        if (patch.getId() === Number(patchId)) {
          return patch;
        }
      }
    }

    return null;
  }

  getPatchByRowCol(row, col) {
    return this.getPatches().at(row).at(col);
  }

  getPatches() {
    return this.patches;
  }

  getRow(row) {
    return this.getPatches().at(row);
  }

  setName(name) {
    this.name = name;
  }

  setRows(rows) {
    let currentRows = this.getRows();

    if (rows <= this.getRows()) {
      this.getPatches().length = rows;
    } else {
      for (let row = currentRows; row < rows; row += 1) {
        this.addRow(row);
      }
    }

    this.rows = rows;
  }

  setCols(cols) {
    let currentCols = this.getCols();

    for (let row in this.getPatches()) {
      if (cols <= currentCols) {
        this.getRow(row).length = cols;
      } else {
        for (let col = currentCols; col < cols; col += 1) {
          this.addPatch(row, col);
        }
      }
    }

    this.cols = cols;
  }

  addPatch(row, col) {
    this.getRow(row).push(new Patch(row, col));
  }

  addPlantsTo(patchList, plant) {
    for (let patch of patchList) {
      patch.setPlant(plant);
    }
  }

  deletePlantsFrom(patchList) {
    for (let patch of patchList) {
      patch.deletePlant();
    }
  }

  deleteAllPlants() {
    for (let row of this.getPatches()) {
      for (let patch of row) {
        patch.deletePlant();
      }
    }
  }

  isChanged(name, length, width) {
    return (this.getName() !== name ||
      this.getLength() !== Number(length) ||
      this.getWidth() !== Number(width));
  }

  getName() {
    return this.name || undefined;
  }

  getRows() {
    return this.rows || undefined;
  }

  getCols() {
    return this.cols || undefined;
  }

  getLength() {
    return this.getCols();
  }

  getWidth() {
    return this.getRows();
  }

  getId() {
    return this.id;
  }

  update(name, length, width) {
    this.setName(name);
    this.setRows(Number(width));
    this.setCols(Number(length));
  }

  forEachPatch(callback) {
    for (let row of this.getRows()) {
      for (let patch of row) {
        callback(patch);
      }
    }
  }

  somePatch(callback) {
    return this.getPatches().some(row => row.some(patch => callback(patch)));
  }

  somePatchIsPlanted() {
    return this.somePatch(patch => patch.isPlanted());
  }

  isComplete() {
    return (this.getName() && this.getRows() && this.getCols());
  }

  hasPatchesToDelete() {
    return this.getSelectedPatches().some(patch => patch.isPlanted());
  }

  getStats() {
    return this.getPatches().reduce((stats, row) => {
      for (let patch of row) {
        if (patch.isPlanted()) {
          let stat = stats.find(stat => stat.name === patch.getPlantName());

          if (!stat) {
            stat = {
              name: patch.getPlantName(),
              emoji: patch.getPlantEmoji(),
              count: patch.getPlantYieldRate(),
              weight: patch.getPlantYieldWeight(),
              calories: patch.getPlantCalories() * patch.getPlantYieldRate(),
            };

            stats.push(stat);
          } else {
            stat.count += patch.getPlantYieldRate();
            stat.weight += patch.getPlantYieldWeight();
            stat.calories +=
              patch.getPlantCalories() * patch.getPlantYieldRate();
          }
        }
      }

      return stats;
    }, []).sort((statA, statB) => statA.name.localeCompare(statB.name));
  }

  getStagedPlant() {
    return this.stagedPlant;
  }

  setStagedPlant(plant) {
    this.stagedPlant = plant;
  }

  hasStagedPlant() {
    return !!this.getStagedPlant();
  }

  clearStagedPlant() {
    this.stagedPlant = undefined;
  }

  getInfoPlant() {
    return this.infoPlant;
  }

  setInfoPlant(plant) {
    this.infoPlant = plant;
  }

  hasInfoPlant() {
    return !!this.getInfoPlant();
  }

  clearInfoPlant() {
    this.infoPlant = undefined;
  }

  setId(id) {
    this.id = Number(id);
  }
}

module.exports = Plot;