/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
const Plot = require("./plot");

class Plots {
  constructor() {
    this.plots = [];
  }

  getPlots() {
    return this.plots;
  }

  addPlot(plot) {
    this.getPlots().push(plot);
    return plot.getId();
  }

  deletePlot(plotId) {
    let index = this.findIndex(plotId);
    this.getPlots().splice(index, 1);
  }

  hasPlot(plotId) {
    return this.findIndex(plotId) !== -1;
  }

  getPlot(plotId) {
    return this.getPlots().find(plot => plot.id === Number(plotId));
  }

  findIndex(plotId) {
    return this.getPlots().findIndex(plot => plot.getId() === Number(plotId));
  }

  static loadPlots(rawPlotData, newPlots, plants) {
    for (let plot of rawPlotData.plots) {
      let newId = newPlots.addPlot(new Plot(plot.name, plot.cols, plot.rows));
      let newPlot = newPlots.getPlot(newId);
      newPlot.setId(plot.id);

      for (let row of plot.patches) {
        for (let patchIndex in row) {
          let patch = row[patchIndex];
          let plant = patch.plant ? patch.plant.name : undefined;
          newPlot.getPatchByRowCol(patch.row, patch.col)
            .setPlant(plants.getPlant(plant))
            .setId(patch.id);
        }
      }

      for (let patch of plot.patchesToPlant) {
        let newPatchToPlant = newPlot.getPatchByRowCol(patch.row, patch.col);
        newPlot.addPatchToPlant(newPatchToPlant);
      }

      if (plot.stagedPlant) {
        newPlot.setStagedPlant(plants.getPlant(plot.stagedPlant.name));
      }

      if (plot.infoPlant) {
        newPlot.setInfoPlant(plants.getPlant(plot.infoPlant.name));
      }
    }

    return newPlots;
  }
}

module.exports = Plots;