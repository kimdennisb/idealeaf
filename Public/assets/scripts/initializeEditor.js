// text editor

if (typeof window.pell !== "undefined") {
  let editor = window.pell.init({
    element: document.getElementById("editor"),
    defaultParagraphSeparator: "p",
    placeholder: "Type something...",
    imageUpload: {},
  });

  window.editor = editor;

  if (window.location.href.includes("/edit")) {
    const title = document.querySelector(".edittitle").textContent.trim();
    const article = document.querySelector(".edithtml").textContent;
    document.querySelector(".title").innerHTML = title;
    document.querySelector('div [contenteditable="true"]').innerHTML = article;

    window.addEventListener("DOMContentLoaded", (event) => {
      const editor = window.editor.querySelector(
        "div [contentEditable='true']"
      );
      editor.addEventListener(
        "keydown",
        window.pell.default.deleteImageFromContentEditable
      );

      const parentFigure = document.querySelectorAll(
        "figure[differential='old']"
      );
      parentFigure.forEach((figure) => {
        const nextI = figure.querySelector(".next");
        const prevI = figure.querySelector(".prev");
        const slides = figure.querySelectorAll("figure");
        if (nextI && prevI) {
          window.pell.default.showSlides(slides, nextI, prevI);
        }

        const editImage = figure.querySelectorAll(".editImage");

        editImage.forEach((edit) => {
          edit.addEventListener(
            "click",
            window.pell.default.editOverlay(window.pell.default.showSlides)
          );
        });
      });
    });
  }
}
