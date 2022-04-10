const nextId = require("./next-id");

class Patch {
  static UNPLANTED_PATCH_COLOR_STRING = 'var(--unplanted-patch-rgb)';
  static NO_PLANT_EMOJI = '';

  constructor(row, col) {
    this.id = nextId();
    this.row = row;
    this.col = col;
    this.plant = null;
  }

  setPlant(plant) {
    this.plant = plant;
  }

  deletePlant() {
    this.plant = null;
  }

  getId() {
    return this.id;
  }

  toString() {
    const NO_PLANT_NAME = '';
    return `${this.isPlanted() ? this.getPlantName() : NO_PLANT_NAME}`;
  }

  getPlant() {
    return this.plant;
  }

  getPlantName() {
    return this.getPlant().getName();
  }

  getPlantColor() {
    return this.isPlanted() ?
      this.getPlant().getColor() : Patch.UNPLANTED_PATCH_COLOR_STRING;
  }

  getPlantEmoji() {
    return `${this.isPlanted() ? this.getPlant().getEmoji() : Patch.NO_PLANT_EMOJI}`;
  }

  getPlantYieldRate() {
    return this.getPlant().getYieldRate();
  }

  getPlantYieldWeight() {
    return this.getPlant().getYieldWeight();
  }

  getPlantCalories() {
    return this.getPlant().getCalories();
  }

  isPlanted() {
    return !!this.getPlant();
  }
}

module.exports = Patch;