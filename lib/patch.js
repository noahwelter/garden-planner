const nextId = require("./next-id");

class Patch {
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
    return this.getPlant().getColor();
  }

  getPlantEmoji() {
    const NO_PLANT_EMOJI = '💩';
    return `${this.isPlanted() ? this.getPlant().getEmoji() : NO_PLANT_EMOJI}`;
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
    return this.getPlant();
  }
}

module.exports = Patch;