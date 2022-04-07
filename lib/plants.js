class Plants {
  constructor() {
    this.plants = [];
  }

  getPlants() {
    return this.plants;
  }

  addPlant(plant) {
    this.getPlants().push(plant);
  }

  getPlant(plantName) {
    return this.getPlants()
      .find(plant => plant.getName().toLowerCase() === plantName.toLowerCase());
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