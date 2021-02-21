(function (global, factory) {
  // debugging
  // console.log(global,factory)
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports)
    : typeof define === "function" && define.amd ? define(["exports"], factory)
      : (factory((global.pell = {})));
}(this, ((exports) => {
  const _extends = Object.assign || function (target) {
    for (let i = 1; i < arguments.length; i++) {
      const source = arguments[i];
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    } return target;
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
    console.log(arguments, "xoxo");
    const value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    return document.execCommand(command, false, value);
  };

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
        // var url = window.prompt('Enter the image URL');
        // if (url) exec('insertImage', url);
        execInsertImageAction();
      },
    },
  };

  // default for not set `upload` config
  var execInsertImageAction = function execInsertImageAction() {
    const uploadImageInput = document.querySelector(".pell input[type=\"file\"]");
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

    window.fetch(api, {
      method: "POST",
      body: data,
    }).then((res) => res.json()).then((data) => {
      // console.log(data)
      // success(data.url);
      data.forEach((imageURL) => {
        success(`${imageURL}`);
      });
    }, (err) => error(err));
  };

  const initUploadImageInput = function initUploadImageInput(settings) {
    const uploadAPI = settings.upload && settings.upload.api;
    if (uploadAPI) {
      const input = document.createElement("input");
      input.type = "file";
      input.hidden = true;
      input.name = "photo";
      input.accept = "image/*";
      input.multiple = true;
      addEventListener(input, "change", (e) => {
        const _images = e.target.files;
        const fd = new window.FormData();
        // fd.append('pell-upload-image',image);
        for (let i = 0; i < _images.length; i++) {
          console.log(_images[i]);
          fd.append("photo", _images[i]);
        }

        uploadImage({
          api: uploadAPI,
          data: fd,
        }, (url) => {
          // return exec('insertImage',url);
          // build src from string srcsets and sizes media condition
          const src = url.split(",")[2].split(" ")[0];
          return exec("insertHTML", `<img srcset="${url}" src="${src}" sizes="(max-width: 320px) 240px,(max-width: 600px) and (min-width: 320px) 320px,(min-width: 600px) 480px,240px" alt=""  />`);
        }, (err) => window.alert(err));
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
    console.log(Object.keys(settings), settings);
    console.log(Object.keys(defaultActions));
    const actions = settings.actions ? settings.actions.map((action) => {
      if (typeof action === "string") return defaultActions[action];
      if (defaultActions[action.name]) return { ...defaultActions[action.name], ...action };
      return action;
    }) : Object.keys(defaultActions).map((action) => defaultActions[action]);
    console.log(actions);
    // copy values and return the values
    const classes = { ...defaultClasses, ...settings.classes };
    console.log(classes);

    // use 'p' or 'div'
    const defaultParagraphSeparator = settings[defaultParagraphSeparatorString] || "div";

    // actionBar
    const actionbar = createElement("div");
    actionbar.className = classes.actionbar;// `pell-actionBar`
    appendChild(settings.element, actionbar);
    console.log(settings.element, actionbar);

    // save and done buttons
    const saveDone = createElement("div");
    saveDone.className = "saveDone";
    const save = createElement("button");
    const done = createElement("button");
    save.setAttribute("type", "button");
    save.style.margin = "2px";
    save.style.color = "green";
    save.id = "pell-push";

    done.setAttribute("type", "button");
    save.innerHTML = "save";
    done.innerHTML = "Done";
    done.style.margin = "2px";
    done.style.color = "green";
    done.className = "done";

    saveDone.appendChild(save);
    saveDone.appendChild(done);
    saveDone.style.textAlign = "right";

    const content = settings.element.content = createElement("div");
    content.contentEditable = true;
    content.className = classes.content; // `pell-content`
    if (settings.placeholder) {
      content.dataset.placeholder = settings.placeholder;
    }
    console.log(settings.element, content);

    // create and append input field for the title
    const inputTitle = createElement("input");
    inputTitle.type = "text";
    inputTitle.placeholder = "Title here...";
    inputTitle.id = "title";
    inputTitle.required = true;
    appendChild(settings.element, inputTitle);

    // listener for any input to the content-editable section
    content.oninput = function (_ref) {
      const { firstChild } = _ref.target;
      console.log(_ref.target.firstChild, firstChild.nodeType, content.innerHTML);

      if (firstChild && firstChild.nodeType === 3) exec(formatBlock, `<${defaultParagraphSeparator}>`);
      else if (content.innerHTML === "<br>") content.innerHTML = "";
      console.log(content.innerHTML);
      settings.onChange(content.innerHTML);
    };
    content.onkeydown = function (event) {
      if (event.key === "Enter" && queryCommandValue(formatBlock) === "blockquote") {
        setTimeout(() => exec(formatBlock, `<${defaultParagraphSeparator}>`), 0);
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
          return button.classList[action.state() ? "add" : "remove"](classes.selected);// `pell-button-selected`
        };
        addEventListener(content, "keyup", handler);
        addEventListener(content, "mouseup", handler);
        addEventListener(button, "click", handler);
      }

      appendChild(actionbar, button);
    });

    // append the save and done buttons
    appendChild(actionbar, saveDone);

    if (settings.styleWithCSS) exec("styleWithCSS");
    exec(defaultParagraphSeparatorString, defaultParagraphSeparator);

    // init a upload image or not
    initUploadImageInput(settings);

    return settings.element;
  };

  const pell = { exec, init };

  exports.exec = exec;
  exports.init = init;
  exports.default = pell;

  Object.defineProperty(exports, "__esModule", { value: true });
})));
