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
}

module.exports = Plots;