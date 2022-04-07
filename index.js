/* eslint-disable max-lines-per-function */
const express = require("express");
const morgan = require("morgan");
const Plant = require("./lib/plant");
const flash = require("express-flash");
const session = require("express-session");
const { body, validationResult } = require("express-validator");
// const store = require("connect-loki");
const Plot = require("./lib/plot");
const Plots = require("./lib/plots");
const Plants = require("./lib/plants");

const app = express();
const HOST = "localhost";
const PORT = 3000;
//const LokiStore = store(session);

// Initial setup for testing
const plots = new Plots();
for (let index = 1; index <= 4; index += 1) {
  plots.addPlot(new Plot(`Plot ${index}`, index, index + 1));
}

const plants = new Plants();
plants.addPlant(new Plant('Carrot', '255, 165, 0', '🥕', 0.31, 1, 186));
plants.addPlant(new Plant('Tomato', '255, 99, 71', '🍅', 0.37, 30, 81));
plants.addPlant(new Plant('Cucumber', '202, 222, 198', '🥒', 0.44, 10, 68));
plants.addPlant(new Plant('Potato', '183, 146, 104', '🥔', 0.47, 6, 347));

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
}));

app.use(flash());

// Set up persistent session data
// app.use((req, res, next) => {
//   let plots = [];

//   if ("plots" in req.session) {
//     req.session.plots.forEach(plot => {
//       plots.push(Plot.makePlot(plot));
//     });
//   }

//   req.session.plots = plots;
//   next();
// });

// // Extract session info
// app.use((req, res, next) => {
//   res.locals.flash = req.session.flash;
//   delete req.session.flash;
//   next();
// });

app.get("/", (_req, res) => {
  res.redirect("plots");
});

app.get("/plots", (_req, res) => {
  res.render("plots", {
    plots: plots.getPlots(),
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
    res.render("plot", {
      flash: req.flash(),
      plot: plots.getPlot(plotId),
      plants: plants.getPlants(),
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
    .isLength({ max: 100 })
    .withMessage("Maximum length of plot name is 100 characters."),
  body("plotLength")
    .notEmpty()
    .withMessage("Please enter a length.")
    .bail()
    .isInt({ min: 1, max: 20})
    .withMessage("Please enter an integer length between 1 and 20 in feet."),
  body("plotWidth")
    .notEmpty()
    .withMessage("Please enter a width.")
    .bail()
    .isInt({ min: 1, max: 20})
    .withMessage("Please enter an integer width between 1 and 20 in feet."),
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
    .isLength({ max: 100 })
    .withMessage("Maximum length of plot name is 100 characters."),
  body("plotLength")
    .isInt({ min: 1, max: 20})
    .withMessage("Please enter an integer length between 1 and 20 in feet."),
  body("plotWidth")
    .isInt({ min: 1, max: 20})
    .withMessage("Please enter an integer width between 1 and 20 in feet."),
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
    } else if (plot.isChanged(plotName, plotLength, plotWidth)) {
      plot.update(plotName, plotLength, plotWidth);
      req.flash("success", "Plot updated");
      res.redirect(`/plots/${plotId}`);
    } else {
      res.redirect(`/plots/${plotId}`);
    }
  }
);

const PLANT_VALIDATOR = [
  body("plant")
    .notEmpty()
    .withMessage("Please enter a name.")
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
        plants: plants.getPlants(),
      });
    } else if (!plots.hasPlot(plotId)) {
      next(new Error(`Plot ${plotId} not found!`));
    } else {
      let plot = plots.getPlot(plotId);
      let plant = plants.getPlant(req.body.plant);

      plot.addPlantsTo(plot.getPatchesToPlant(), plant);
      req.flash("success", `${plot.getPatchesToPlant().length} ${plant.getEmoji()} planted`);
      plot.clearPatchesToPlant();
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
    plot.deletePlantsFrom(plot.getPatchesToPlant());
    plot.clearPatchesToPlant();
    req.flash("success", "Plants deleted");
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
app.listen(PORT, HOST, () => {
  console.log(`Listening on port ${PORT} of ${HOST}`);
});