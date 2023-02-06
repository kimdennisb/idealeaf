// text editor

if (typeof window.pell !== "undefined") {
  let editor = window.pell.init({
    element: document.getElementById("editor"),
    defaultParagraphSeparator: "p",
    placeholder: "Type something...",
    /*onChange(html) {
            document.getElementById("html-output").textContent = html;
        },
        upload: {
            api: "/admin/images",
        },*/
    imageUpload: {},
  });

  //window.editor = editor;

  if (window.location.href.includes("/edit")) {
    const title = document.querySelector(".edittitle").textContent.trim();
    const article = document.querySelector(".edithtml").textContent;
    document.querySelector(".title").innerHTML = title;
    document.querySelector('div [contenteditable="true"]').innerHTML = article;

    const createElement = function createElement(tag) {
      return document.createElement(tag);
    };

    const editOverlay = function editOverlay(e) {
      //parent edit div
      const div = document.createElement("div");
      div.contentEditable = false;
      div.className = "editOverlay";
      div.style.height = `${this.parentNode.clientHeight}px`;
      div.style.width = `${this.parentNode.clientWidth}px`;
      div.style.position = `absolute`;
      div.style.zIndex = 99999;
      div.style.backgroundColor = `ghostwhite`;
      div.style.borderRadius = "18px";

      //header edit div
      const editHeader = createElement("div");
      editHeader.className = "editHeader";

      //Back button
      const backButton = createElement("div");
      backButton.className = "backButton";

      //correct action text
      const action = createElement("p");
      action.textContent = "Edit description";

      //next/previous and save buttons for image editing
      const nextImage = createElement("div");
      nextImage.className = "nextImage";

      const prevImage = createElement("div");
      prevImage.className = "previousImage";

      const saveEdits = createElement("button");
      saveEdits.className = "saveEdits";
      saveEdits.textContent = "Save";

      //next,previous and save container
      const nextPreviousSave = createElement("div");
      nextPreviousSave.className = "nextPreviousSaveContainer";
      nextPreviousSave.append(nextImage, prevImage, saveEdits);

      editHeader.append(backButton, action, nextPreviousSave);

      //what's being edited descriptors
      const descriptors = createElement("div");
      descriptors.className = "descriptorsContainer";

      const description = createElement("p");
      description.className = "description";
      description.textContent = "Des";

      const altName = createElement("p");
      altName.className = "altName";
      altName.textContent = "Alt";

      descriptors.append(description, altName);

      //image preview
      const imagePreview = createElement("div");
      imagePreview.className = "imagePreview";
      const imagesToPreview = this.parentNode.querySelectorAll("figure img");

      const imagesToPreviewCopy = Array.from(imagesToPreview).map(
        (item, index) => {
          item.className = `uniqueC-${index}`;
          item.draggable = false;
          return item.cloneNode();
        }
      );

      imagePreview.append(...imagesToPreviewCopy);

      //Description textbox
      const textBox = createElement("input");
      textBox.className = "textbox";

      div.append(editHeader, descriptors, imagePreview, textBox);

      this.parentNode.append(div);

      //preview window slides
      let slideIndex = 1;
      showSlides(slideIndex);
      function plusSlides(n) {
        showSlides((slideIndex += n));
      }

      function showSlides(n) {
        var i;
        var slides = document.querySelectorAll(".imagePreview img");
        if (n > slides.length) {
          slideIndex = 1;
        }
        if (n < 1) {
          slideIndex = slides.length;
        }
        for (i = 0; i < slides.length; i++) {
          slides[i].style.display = "none";
        }
        slides[slideIndex - 1].style.display = "block";
      }

      //listen for clicks from image edit window
      addEventListener(backButton, "click", (e) => div.remove());
      addEventListener(nextImage, "click", (e) => plusSlides(1));
      addEventListener(prevImage, "click", (e) => plusSlides(-1));
      addEventListener(saveEdits, "click", (e) => {
        const figCaption = this.parentNode
          .querySelectorAll("figure")
          [slideIndex - 1].querySelector("figCaption");
        const image = this.parentNode
          .querySelectorAll("figure")
          [slideIndex - 1].querySelector("img");
        action.textContent.includes(`description`)
          ? (figCaption.textContent = textBox.value)
          : (image.alt = textBox.value);
        div.remove();
      });
      addEventListener(description, "click", (e) => {
        textBox.value = "";
        action.textContent = `Edit description`;
      });
      addEventListener(altName, "click", (e) => {
        textBox.value = "";
        action.textContent = `Edit Alt`;
      });
    };

    //slide images to look cool
    var slideIndex = 1;
    showSlides(slideIndex);

    // next/previous controls
    function plusSlides(n, rqwe) {
      showSlides((slideIndex += n), rqwe);
    }

    const parentFigure = document.querySelectorAll(
      "figure[differential='old']"
    );

    parentFigure.forEach((figure) => {
      const nextI = figure.querySelector(".next");
      const prevI = figure.querySelector(".prev");
      nextI
        ? nextI.addEventListener("click", function (e) {
            plusSlides(1, nextI);
          })
        : null;
      prevI
        ? prevI.addEventListener("click", function (e) {
            plusSlides(-1, this);
          })
        : null;

      const editImage = figure.querySelectorAll(".editImage");

      editImage.forEach((edit) => {
        edit.addEventListener("click", editOverlay);
      });
    });

    function showSlides(n, rqwe) {
      let i;
      if (rqwe !== undefined) {
        const slides = rqwe.parentNode.querySelectorAll("figure");
        n > slides.length ? (slideIndex = 1) : null;
        n < 1 ? (slideIndex = slides.length) : null;

        for (i = 0; i < slides.length; i++) {
          Array.from(slides)[i].style.display = "none";
          Array.from(slides)[slideIndex - 1].style.display = "block";
        }
      } else {
        const parentFigure = document.querySelectorAll(
          "figure[differential='old']"
        );

        parentFigure.forEach((figure) => {
          const slides = figure.querySelectorAll("figure");

          n > slides.length ? (slideIndex = 1) : null;
          n < 1 ? (slideIndex = slides.length) : null;

          for (i = 0; i < slides.length; i++) {
            Array.from(slides)[i].style.display = "none";
            Array.from(slides)[slideIndex - 1].style.display = "block";
          }
        });
      }
    }
  }
}
