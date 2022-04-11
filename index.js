/* eslint-disable max-lines-per-function */
const express = require("express");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const { body, validationResult } = require("express-validator");
const store = require("connect-loki");
const LokiStore = store(session);

const app = express();
// const HOST = "localhost";
const PORT = process.env.PORT || 3000;

const Plants = require("./lib/plants");
const Plot = require("./lib/plot");
const Plots = require("./lib/plots");

const plots = new Plots();
const plants = new Plants();

app.set("views", "./views");
app.set("view engine", "pug");

app.use(morgan("common"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  cookie: {
    httpOnly: true,
    maxAge: 31 * 24 * 60 * 60 * 1000,
    path: "/",
    secure: false,
  },
  name: "garden-planner-session-id",
  resave: false,
  saveUninitialized: true,
  secret: "unsecure_secret",
  store: new LokiStore({}),
}));

app.use(flash());

// Set up persistent session data
// app.use((req, res, next) => {

//   next();
// });

// Extract session info
app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

app.get("/", (_req, res) => {
  res.redirect("plots");
});

app.get("/plots", (_req, res) => {
  res.render("plots", {
    plots: plots,
  });
});

app.get("/plots/new", (_req, res) => {
  res.render("new-plot");
});

app.get("/plots/:plotId", (req, res, next) => {
  let plotId = req.params.plotId;

  if (!plots.hasPlot(plotId)) {
    next(new Error(`Plot ${plotId} not found!`));
  } else {
    let plot = plots.getPlot(plotId);

    res.render("plot", {
      flash: req.flash(),
      plot,
      plants,
      plant: plot.getStagedPlant(),
    });
  }
});

app.get("/plots/:plotId/edit-plot-details", (req, res, next) => {
  let plotId = req.params.plotId;

  if (!plots.hasPlot(plotId)) {
    next(new Error(`Plot ${plotId} not found!`));
  } else {
    res.render("edit-plot", {
      plot: plots.getPlot(plotId),
    });
  }
});

const NEW_PLOT_VALIDATION = [
  body("plotName")
    .notEmpty()
    .withMessage("Please enter a name.")
    .isLength({ max: 70 })
    .withMessage("Maximum length of plot name is 70 characters."),
  body("plotLength")
    .notEmpty()
    .withMessage("Please enter a length.")
    .bail()
    .isInt({ min: 1, max: 50})
    .withMessage("Please enter an integer length between 1 and 50 in feet."),
  body("plotWidth")
    .notEmpty()
    .withMessage("Please enter a width.")
    .bail()
    .isInt({ min: 1, max: 50})
    .withMessage("Please enter an integer width between 1 and 50 in feet."),
];

app.post("/plots/new", NEW_PLOT_VALIDATION,
  (req, res) => {
    let errors = validationResult(req);
    let { plotName, plotLength, plotWidth } = { ...req.body };

    if (!errors.isEmpty()) {
      errors.array().forEach(error => req.flash("error", error.msg));
      res.render("new-plot", {
        flash: req.flash(),
        plotName,
        plotLength,
        plotWidth,
      });
    } else {
      let plotId = plots.addPlot(new Plot(plotName, plotLength, plotWidth));
      res.redirect(`/plots/${plotId}`);
    }
  }
);

const EDIT_PLOT_VALIDATION = [
  body("plotName")
    .optional({nullable: true, checkFalsy: true})
    .isLength({ max: 70 })
    .withMessage("Maximum length of plot name is 70 characters."),
  body("plotLength")
    .optional({nullable: true, checkFalsy: true})
    .isInt({ min: 1, max: 10})
    .withMessage("Please enter an integer length between 1 and 10 in feet."),
  body("plotWidth")
    .optional({nullable: true, checkFalsy: true})
    .isInt({ min: 1, max: 10})
    .withMessage("Please enter an integer width between 1 and 10 in feet."),
];

app.post("/plots/:plotId/edit-plot-details", EDIT_PLOT_VALIDATION,
  (req, res) => {
    let errors = validationResult(req);
    let { plotId, plotName, plotLength, plotWidth } = { ...req.body };
    let plot = plots.getPlot(plotId);

    if (!errors.isEmpty()) {
      errors.array().forEach(error => req.flash("error", error.msg));
      res.render("edit-plot", {
        flash: req.flash(),
        plot,
        plotName,
        plotLength,
        plotWidth,
      });
    } else {
      if (!plotName) plotName = plot.getName();
      if (!plotLength) plotLength = plot.getLength();
      if (!plotWidth) plotWidth = plot.getWidth();

      plot.update(plotName, plotLength, plotWidth);
      req.flash("success", "Plot updated");
      res.redirect(`/plots/${plotId}`);
    }
  }
);

const PLANT_VALIDATOR = [
  body("plant")
    .notEmpty()
    .withMessage("Please select a plant.")
    .bail()
    .custom((plant, { _req }) => {
      return plants.hasPlant(plant);
    })
    .withMessage("Please select a plant from the list.")
];

app.post("/plots/:plotId/plant", PLANT_VALIDATOR,
  (req, res, next) => {
    let errors = validationResult(req);
    let plotId = req.params.plotId;

    if (!errors.isEmpty()) {
      errors.array().forEach(error => req.flash("error", error.msg));
      res.render("plot", {
        flash: req.flash(),
        plot: plots.getPlot(plotId),
        plants,
      });
    } else if (!plots.hasPlot(plotId)) {
      next(new Error(`Plot ${plotId} not found!`));
    } else {
      let plot = plots.getPlot(plotId);
      let plant = plants.getPlant(req.body.plant);

      plot.addPlantsTo(plot.getSelectedPatches(), plant);
      req.flash("success", `${plot.getSelectedPatches().length} ${plant.getEmoji()} planted`);
      plot.clearPatchesToPlant();
      plot.clearStagedPlant();
      res.redirect(`/plots/${plotId}`);
    }
  }
);

app.post("/plots/:plotId/plant/info", PLANT_VALIDATOR,
  (req, res, next) => {
    let errors = validationResult(req);
    let plotId = req.params.plotId;

    if (!errors.isEmpty()) {
      errors.array().forEach(error => req.flash("error", error.msg));
      res.render("plot", {
        flash: req.flash(),
        plot: plots.getPlot(plotId),
        plants,
      });
    } else if (!plots.hasPlot(plotId)) {
      next(new Error(`Plot ${plotId} not found!`));
    } else {
      let plot = plots.getPlot(plotId);
      let plant = plants.getPlant(req.body.plant);
      plot.setStagedPlant(plant);

      res.redirect(`/plots/${plotId}`);
    }
  }
);

app.post("/plots/:plotId/delete-plants", (req, res, next) => {
  let plotId = req.params.plotId;
  let plot = plots.getPlot(plotId);

  if (!plot) {
    next(new Error(`Plot ${plotId} not found!`));
  } else {
    plot.deletePlantsFrom(plot.getSelectedPatches());
    plot.clearPatchesToPlant();
    req.flash("success", "Plants removed");
    res.redirect(`/plots/${plotId}`);
  }
});

app.post("/plots/:plotId/delete-plot", (req, res, next) => {
  let plotId = req.params.plotId;

  if (!plots.hasPlot(plotId)) {
    next(new Error(`Plot ${plotId} not found!`));
  } else {
    plots.deletePlot(plotId);
    req.flash("success", "Plot deleted");
    res.redirect("/plots");
  }
});

app.post("/plots/:plotId/clear-selection", (req, res, next) => {
  let plotId = req.params.plotId;

  if (!plots.hasPlot(plotId)) {
    next(new Error(`Plot ${plotId} not found!`));
  } else {
    plots.getPlot(plotId).clearPatchesToPlant();
    res.redirect(`/plots/${plotId}`);
  }
});

app.post("/plots/:plotId/clear-plot", (req, res, next) => {
  let plotId = req.params.plotId;

  if (!plots.hasPlot(plotId)) {
    next(new Error(`Plot ${plotId} not found!`));
  } else {
    plots.getPlot(plotId).deleteAllPlants();
    plots.getPlot(plotId).clearPatchesToPlant();
    req.flash("success", "All plants cleared 🚜");
    res.redirect(`/plots/${plotId}`);
  }
});

app.post("/plots/:plotId/patches/:patchId", (req, res, next) => {
  let plotId = req.params.plotId;

  if (!plots.hasPlot(plotId)) {
    next(new Error(`Plot ${plotId} not found!`));
  }

  let plot = plots.getPlot(plotId);
  let patchId = req.params.patchId;
  let patch = plot.getPatch(patchId);
  let plant = plants.getPlant(req.body.plant);
  plot.setStagedPlant(plant);

  if (!patch) {
    next(new Error(`Patch ${patchId} not found!`));
  }

  if (!plot.isPatchToPlant(patch)) {
    plot.addPatchToPlant(patch);
  } else {
    plot.deletePatchToPlant(patch);
  }

  res.redirect(`/plots/${plotId}`);
});

// Error handler middleware
app.use((err, _req, res, _next) => {
  console.log(err); // Writes more extensive information to the console log
  res.status(404).send(err.message);
});

// Listener
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});