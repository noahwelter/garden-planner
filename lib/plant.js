class Plant {
  constructor(attributes) {
    this.name = attributes.name;
    this.color = attributes.color;
    this.emoji = attributes.emoji;
    this.weight = attributes.weight;  // In lbs
    this.yieldRate = attributes.yieldRate;  // Fruit/veg per plant
    this.calories = attributes.calories;
    this.daysToMaturity = attributes.daysToMaturity;
    this.spread = attributes.spread;
    this.height = attributes.height;
  }

  getName() {
    return this.name;
  }

  getColor() {
    return this.color;
  }

  getDaysToMaturity() {
    return this.daysToMaturity;
  }

  getSpread() {
    return this.spread;
  }

  getHeight() {
    return this.height;
  }

  getEmoji() {
    return this.emoji;
  }

  getPlantWeight() {
    return this.weight;
  }

  getYieldWeight() {
    return this.yieldRate * this.getPlantWeight();
  }

  getYieldRate() {
    return this.yieldRate;
  }

  getCalories() {
    return this.calories;
  }

  toString() {
    return this.getName();
  }
}

module.exports = Plant;