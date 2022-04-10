"use strict";

function getMessage(formId) {
  let message = "This cannot be undone!";

  switch (formId) {
    case "clear-plot":
      message = "This will remove all plants from this plot.";
      break;
    case "delete-plot":
      message = "This will delete the plot.";
  }

  return message;
}

document.addEventListener("DOMContentLoaded", function () {
  let forms = document.querySelectorAll("form#clear-plot, form#delete-plot");

  forms.forEach(form => {
    let message = getMessage(form.id);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (confirm(`Are you sure? ${message}`)) {
        event.target.submit();
      }
    });
  });
});