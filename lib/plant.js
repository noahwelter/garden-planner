class Plant {
  constructor(name, color, emoji, weight, yieldRate, calories) {
    this.name = name;
    this.color = color;
    this.emoji = emoji;
    this.weight = weight;  // In lbs
    this.yieldRate = yieldRate;  // Fruit/veg per plant
    this.calories = calories;
  }

  getName() {
    return this.name;
  }

  getColor() {
    return this.color;
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