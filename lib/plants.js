class Plants {
  constructor() {
    this.plants = [];
  }

  getPlants() {
    return this.plants;
  }

  sort() {
    this.getPlants().sort((plantA, plantB) => plantA.localeCompare(plantB));
  }

  getPlantRegexList() {
    return this.getPlants()
      .reduce((pattern, plant) => {
        pattern += plant.getName()
          .split('')
          .reduce((charPattern, char) => {
            charPattern += `[${char.toLowerCase()}${char.toUpperCase()}]`;
            return charPattern;
          }, '');
        pattern += '|';

        return pattern;
      }, '');
  }

  addPlant(plant) {
    this.getPlants().push(plant);
  }

  getPlant(plantName) {
    return plantName ? this.getPlants()
      .find(plant => plant.getName().toLowerCase() === plantName.toLowerCase())
      : undefined;
  }

  hasPlant(plantName) {
    return this.getPlant(plantName);
  }

  getPlantNames() {
    return this
      .getPlants()
      .reduce((plantNames, plant) => {
        plantNames.push(plant.getName());
        return plantNames;
      }, []);
  }
}

module.exports = Plants;