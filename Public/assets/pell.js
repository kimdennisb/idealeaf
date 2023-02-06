/* eslint-disable no-restricted-syntax */
/* eslint-disable prefer-rest-params */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable no-multi-assign */
/* eslint-disable no-plusplus */
/* eslint-disable no-alert */
/* eslint-disable no-undef */

/* eslint-disable no-nested-ternary */
(function (global, factory) {
  // debugging
  // console.log(global, factory)
  typeof exports === "object" && typeof module !== "undefined"
    ? factory(exports)
    : typeof define === "function" && define.amd
    ? define(["exports"], factory)
    : factory((global.pell = {}));
})(this, (exports) => {
  // console.log(exports);
  // eslint-disable-next-line no-unused-vars
  const _extends =
    Object.assign ||
    function (target) {
      for (let i = 1; i < arguments.length; i++) {
        const source = arguments[i];
        for (const key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };

  const defaultParagraphSeparatorString = "defaultParagraphSeparator";
  const formatBlock = "formatBlock";
  const addEventListener = function addEventListener(parent, type, listener) {
    return parent.addEventListener(type, listener);
  };
  const appendChild = function appendChild(parent, child) {
    return parent.appendChild(child);
  };
  const createElement = function createElement(tag) {
    return document.createElement(tag);
  };
  const queryCommandState = function queryCommandState(command) {
    return document.queryCommandState(command);
  };
  const queryCommandValue = function queryCommandValue(command) {
    return document.queryCommandValue(command);
  };

  const exec = function exec(command) {
    const value =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    return document.execCommand(command, false, value);
  };
  /**
   * execCommand() method is exposed by document object when HTML document has been switched to design mode.
   * execCommand runs commands that manipulate the current editable region(affect document's selection(bold,italics) and
   * inserting new elements(adding a link)).
   * Returns false if the command is unsupported or disabled.
   * queryCommandState() method will tell you if the current selection has execCommand() applied.
   */
  const defaultActions = {
    bold: {
      icon: "<b>B</b>",
      title: "Bold",
      state: function state() {
        return queryCommandState("bold");
      },
      result: function result() {
        return exec("bold");
      },
    },
    italic: {
      icon: "<i>I</i>",
      title: "Italic",
      state: function state() {
        return queryCommandState("italic");
      },
      result: function result() {
        return exec("italic");
      },
    },
    underline: {
      icon: "<u>U</u>",
      title: "Underline",
      state: function state() {
        return queryCommandState("underline");
      },
      result: function result() {
        return exec("underline");
      },
    },
    strikethrough: {
      icon: "<strike>S</strike>",
      title: "Strike-through",
      state: function state() {
        return queryCommandState("strikeThrough");
      },
      result: function result() {
        return exec("strikeThrough");
      },
    },
    heading1: {
      icon: "<b>H<sub>1</sub></b>",
      title: "Heading 1",
      result: function result() {
        return exec(formatBlock, "<h1>");
      },
    },
    heading2: {
      icon: "<b>H<sub>2</sub></b>",
      title: "Heading 2",
      result: function result() {
        return exec(formatBlock, "<h2>");
      },
    },
    paragraph: {
      icon: "&#182;",
      title: "Paragraph",
      result: function result() {
        return exec(formatBlock, "<p>");
      },
    },
    quote: {
      icon: "&#8220; &#8221;",
      title: "Quote",
      result: function result() {
        return exec(formatBlock, "<blockquote>");
      },
    },
    olist: {
      icon: "&#35;",
      title: "Ordered List",
      result: function result() {
        return exec("insertOrderedList");
      },
    },
    ulist: {
      icon: "&#8226;",
      title: "Unordered List",
      result: function result() {
        return exec("insertUnorderedList");
      },
    },
    code: {
      icon: "&lt;/&gt;",
      title: "Code",
      result: function result() {
        return exec(formatBlock, "<pre>");
      },
    },
    line: {
      icon: "&#8213;",
      title: "Horizontal Line",
      result: function result() {
        return exec("insertHorizontalRule");
      },
    },
    link: {
      icon: "&#128279;",
      title: "Link",
      result: function result() {
        const url = window.prompt("Enter the link URL");
        if (url) exec("createLink", url);
      },
    },
    image: {
      icon: "&#128247;",
      title: "Image",
      result: function result() {
        // eslint-disable-next-line no-use-before-define
        execInsertImageAction();
      },
    },
  };

  // default for not set `upload` config
  const execInsertImageAction = function execInsertImageAction() {
    const uploadImageInput = document.querySelector('.pell input[type="file"]');
    if (!uploadImageInput) {
      const url = window.prompt("Enter the image URL");
      if (url) exec("insertImage", url);
    } else {
      uploadImageInput.click();
    }
  };

  // set `url`,`method` and `body` for fetch api
  const uploadImage = function uploadImage(_ref, success, error) {
    const { api } = _ref;
    const { data } = _ref;

    window
      .fetch(api, {
        method: "POST",
        body: data,
      })
      .then((res) => res.json())
      .then(
        (image) => {
          // console.log(data)
          // success(data.url);
          image.forEach((imageURL) => {
            success(`${imageURL}`);
          });
        },
        (err) => error(err)
      );
  };

  //convert image files to base64
  //returns object i.e {filename: promise of base64}.
  async function fileListToBase64(fileList) {
    function getBase64(file) {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = (ev) => {
          resolve(ev.target.result);
        };
        reader.readAsDataURL(file);
      });
    }

    //convert fileList to Array.
    const fileListArray = Array.from(fileList);

    //Array of {filename:base64}
    const base64imagedata = fileListArray.reduce((total, value) => {
      const filename = value.name;
      const base64 = getBase64(value);
      const filenamebase64 = {
        [filename]: base64,
      };
      return { ...total, ...filenamebase64 };
    }, {});
    return base64imagedata;
  }

  function getFilenameAndExtension(pathfilename) {
    var filenameextension = pathfilename.replace(/^.*[\\\/]/, "");
    var filename = filenameextension.substring(
      0,
      filenameextension.lastIndexOf(".")
    );
    var ext = filenameextension.split(".").pop();
    return [filename, ext];
  }
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

  const initUploadImageInput = function initUploadImageInput(settings) {
    const contentEditable = settings.element.content;

    //const uploadAPI = settings.upload && settings.upload.api;
    const uploadAPI = settings.imageUpload;
    if (uploadAPI) {
      const input = document.createElement("input");
      input.type = "file";
      input.hidden = true;
      input.name = "photo";
      input.accept = "image/*";
      input.multiple = true;
      addEventListener(input, "change", async (e) => {
        /* const keyboard = new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
          cancelable: true,
          keyCode: 13,
        });

        contentEditable.dispatchEvent(keyboard);*/

        const images = Array.from(e.target.files);
        const imageEditorial = document.createElement("div");
        imageEditorial.setAttribute("class", "imageeditorial");

        var figureRep = document.createElement("figure");
        figureRep.setAttribute("role", "group");
        const randomAssig = `r${Math.floor(
          Math.random() * new Date().getMilliseconds()
        ).toString()}`;
        figureRep.className = `slides-container ${randomAssig}`;

        for (let i = 0; i < images.length; i++) {
          const url = URL.createObjectURL(images[i]);
          const filename = getFilenameAndExtension(images[i].name)[0];

          let figure = document.createElement("figure");
          let figCaption = document.createElement("figcaption");
          figCaption.contentEditable = false;

          //span.textContent = "&nbsp";
          figure.style.backgroundImage = `url(${url})`;
          figure.setAttribute("class", `i-${i}`);
          figure.insertAdjacentHTML(
            "beforeend",
            `<img src=${url} alt=${filename} >`
          );
          figure.append(figCaption);
          figureRep.appendChild(figure);
        }

        let div = createElement("div");
        div.setAttribute("class", "editImage");
        div.setAttribute("listener", "false");
        figureRep.append(div);

        imageEditorial.appendChild(figureRep);

        if (images.length > 1) {
          figureRep.insertAdjacentHTML(
            "beforeend",
            `<span contenteditable="false" class="prev">&#10094;</span>`
          );
          figureRep.insertAdjacentHTML(
            "beforeend",
            `<span contenteditable="false" class="next">&#10095;</span>`
          );
        }

        //const figureString = `${figure.outerHTML}<p>&#8203;</p>`;

        const figureString = `${figureRep.outerHTML}<p><br></p>`;

        exec("insertHTML", figureString);

        //Edit image description or alt
        const editImage = document.querySelectorAll(
          "figure[role='group'] .editImage"
        );

        editImage.forEach((edit) => {
          if (edit.getAttribute("listener") == "false") {
            addEventListener(edit, "click", editOverlay);
            edit.setAttribute("listener", "true");
          }
        });

        const figures = document.querySelectorAll(`.${randomAssig}`);
        if (figures) {
          figures.forEach((figure) => {
            figure.addEventListener("click", (e) => {
              if (!figure.nextSibling) {
                //const zerowidthspace = `&#8203;`;
                const p = document.createElement("p");
                //  p.innerHTML = zerowidthspace;
                //p.innerHTML = `<br>`;
                p.insertAdjacentHTML("beforeend", `<br>`);
                figure.parentNode.insertBefore(p, figure.nextSibling);

                //insert caret at the current position of zerowidthspace/ p tag with br tag
                const selection = window.getSelection();
                const range = document.createRange();
                range.setStart(figure.nextSibling, 0);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
              }
            });

            //slide images to look cool
            var slideIndex = 1;
            showSlides(slideIndex, figure.querySelectorAll("figure"));

            // next/previous controls
            function plusSlides(n, rqwe) {
              showSlides((slideIndex += n), rqwe);
            }

            const next = figure.querySelector("span[class='next']");
            const prev = figure.querySelector("span[class='prev']");

            next
              ? addEventListener(next, "click", function (e) {
                  const slides = figure.querySelectorAll("figure");
                  plusSlides(1, slides);
                })
              : null;
            prev
              ? addEventListener(prev, "click", function (e) {
                  const slides = this.parentNode.querySelectorAll("figure");
                  plusSlides(-1, slides);
                })
              : null;

            function showSlides(n, rqwe) {
              let i;
              //we ask for this set because we manipulate DOM directly
              const slides = Array.from(rqwe);

              //check both sides of -ve and +ve values with respect to number of slides and slideIndex.
              n > slides.length ? (slideIndex = 1) : null;
              n < 1 ? (slideIndex = slides.length) : null;

              for (i = 0; i < slides.length; i++) {
                slides[i].style.display = "none";
                slides[slideIndex - 1].style.display = "block";
              }
            }

            function getSelectionTextInfo(el) {
              let atStart = false;
              let atEnd = false;
              let selRange, testRange;
              if (window.getSelection) {
                const sel = window.getSelection();
                if (sel.rangeCount) {
                  selRange = sel.getRangeAt(0);
                  testRange = selRange.cloneRange();

                  testRange.selectNodeContents(el);
                  testRange.setEnd(
                    selRange.startContainer,
                    selRange.startOffset
                  );
                  atStart = testRange.toString() == "";

                  testRange.selectNodeContents(el);
                  testRange.setStart(selRange.endContainer, selRange.endOffset);
                  atEnd = testRange.toString() == "";
                }
              } else if (
                document.selection &&
                document.selection.type != "Control"
              ) {
                selRange = document.selection.createRange();
                testRange = selRange.duplicate();

                testRange.moveToElementText(el);
                testRange.setEndPoint("EndToStart", selRange);
                atStart = testRange.toString() == "";

                testRange.moveToElementText(el);
                testRange.setEndPoint("StartToEnd", selRange);
                atEnd = testRange.toString() == "";
              }
              return { atStart: atStart, atEnd: atEnd };
            }

            const figCaption = document.querySelector("figcaption");

            const observer = new MutationObserver(function (mutations) {
              mutations.forEach((mutation) => {
                Array.from(mutation.removedNodes).forEach(function (node) {
                  const tagName = node.tagName;
                  tagName == "IMG" || "FIGCAPTION"
                    ? mutation.target.parentNode.remove()
                    : mutation.target.remove();
                });
              });
            });

            observer.observe(document.querySelector("[role='group'] figure"), {
              childList: true,
            });

            addEventListener(contentEditable, "keydown", function (e) {
              //disable "ENTER" key
              if (
                (e.keyIdentifier == "Enter" || e.keyCode == 13) &&
                figCaption.contentEditable == "true"
              ) {
                e.preventDefault();
              } else if (
                e.keyCode == 8 &&
                getSelectionTextInfo(figCaption).atStart &&
                figCaption.contentEditable == "true"
              ) {
                e.preventDefault();
              }
            });

            addEventListener(figCaption, "mouseleave", function (e) {
              this.setAttribute("contenteditable", false);
            });
          });
        }
      });
      appendChild(settings.element, input);
    }
  };

  const defaultClasses = {
    actionbar: "pell-actionbar",
    button: "pell-button",
    content: "pell-content",
    selected: "pell-button-selected",
  };

  const init = function init(settings) {
    /*
          Object.keys(object) evaluates to the object data access points in an array form,i.e
           const name = {
             firstName: 'Dennis',
             lastName: 'kimutai'
           }
  
          Object.keys(name) evaluates to  ["firstName","lastName"];
          */
    // console.log(Object.keys(settings), settings);
    // console.log(Object.keys(defaultActions));
    const actions = settings.actions
      ? settings.actions.map((action) => {
          if (typeof action === "string") return defaultActions[action];
          if (defaultActions[action.name])
            return { ...defaultActions[action.name], ...action };
          return action;
        })
      : Object.keys(defaultActions).map((action) => defaultActions[action]);
    // console.log(actions);
    // copy values and return the values
    const classes = { ...defaultClasses, ...settings.classes };
    // console.log(classes);

    // use 'p' or 'div'
    const defaultParagraphSeparator =
      settings[defaultParagraphSeparatorString] || "div";

    // create and append textarea field for the title
    const inputTitle = createElement("textarea");
    inputTitle.name = "title";
    inputTitle.placeholder = "Untitled";
    inputTitle.className = "title";
    inputTitle.required = true;
    appendChild(settings.element, inputTitle);

    // actionBar
    const actionbar = createElement("div");
    actionbar.className = classes.actionbar; // `pell-actionBar` `< div class="pell-actionbar" />`
    appendChild(settings.element, actionbar);
    //console.log(settings.element, actionbar);

    const content = (settings.element.content = createElement("div"));
    content.contentEditable = true;
    content.className = classes.content;
    // `pell-content` `<div class="pell-content" contenteditable="true">
    if (settings.placeholder) {
      content.dataset.placeholder = settings.placeholder;
      // `<div class="pell-content" contenteditable="true" data-placeholder="Type something...">`
    }
    // console.log(settings.element, content);

    // listener for any input to the content-editable section
    content.oninput = function (_ref) {
      const { firstChild } = _ref.target;
      // console.log(_ref.target.firstChild, firstChild.nodeType, content.innerHTML)

      if (firstChild && firstChild.nodeType === 3)
        exec(formatBlock, `<${defaultParagraphSeparator}>`);
      else if (content.innerHTML === "<br>") content.innerHTML = "";

      // settings.onChange(content.innerHTML);
    };

    content.onkeydown = function (event) {
      if (
        event.key === "Enter" &&
        queryCommandValue(formatBlock) === "blockquote"
      ) {
        setTimeout(
          () => exec(formatBlock, `<${defaultParagraphSeparator}>`),
          0
        );
      }
    };

    appendChild(settings.element, content);

    actions.forEach((action) => {
      const button = createElement("button");
      button.className = classes.button; // `pell-button`
      button.innerHTML = action.icon;
      button.title = action.title;
      button.setAttribute("type", "button");

      button.onclick = function () {
        return action.result() && content.focus();
      };
      if (action.state) {
        const handler = function handler() {
          return button.classList[action.state() ? "add" : "remove"](
            classes.selected
          ); // `pell-button-selected`
        };
        addEventListener(content, "keyup", handler);
        addEventListener(content, "mouseup", handler);
        addEventListener(button, "click", handler);
      }

      appendChild(actionbar, button);
    });

    if (settings.styleWithCSS) exec("styleWithCSS");
    exec(defaultParagraphSeparatorString, defaultParagraphSeparator);

    // init a upload image locally or image link
    initUploadImageInput(settings);

    return settings.element;
  };

  const HTMLContent = function HTMLContent() {
    return document.querySelector("div [contenteditable='true']").innerHTML;
  };

  const pell = { exec, init, HTMLContent };

  exports.exec = exec;
  exports.init = init;
  exports.editorHTML = HTMLContent;
  exports.default = pell;

  Object.defineProperty(exports, "__esModule", { value: true });
});
