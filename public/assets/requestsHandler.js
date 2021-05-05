/* eslint-disable camelcase */
/* eslint-disable eqeqeq */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
/*
// add script
function addScript() {
  const popup = document.querySelector(".popup-input");
  const cancel = document.querySelector(".btn_cancel");

  // distinguish between resize and onclick of the buttons and show popup so the width cannot be 0
  // eslint-disable-next-line no-unused-expressions
  (this.id === "injectscript") ? popup.style.display = "block" : null;

  // get popup and window width.
  const popupWidthCenter = (popup.clientWidth / 2);
  const windowCenter = (window.innerWidth / 2);
  const widthNum = (windowCenter - popupWidthCenter);

  // convert width to a percentile & parse to string
  const widthString = ((widthNum * 100) / window.innerWidth).toLocaleString();
  popup.style.left = `${widthString}%`;

  cancel.onclick = () => { popup.style.display = "none"; };

  return `${widthString}%`;
}
const addScriptButton = document.querySelector("#injectscript");
if (addScriptButton) {
  addScriptButton.onclick = addScript;
}

// position the popup at the center on window resizing
// eslint-disable-next-line func-names
window.onresize = function () {
  const popup = document.querySelector(".popup-input");
  popup.style.left = addScript();
};

// grab input from the add script input and insert in header
const insertScript = document.querySelector("input[type='text']");
const saveScript = document.querySelector(".btn_save");

const xhr = new XMLHttpRequest();
saveScript.onclick = () => {
  // store script in the database

  // we open xhr here so that it can be used anytime on `click` event

  xhr.open("POST", "/scriptToInject", true);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-type", "application/json");

  const data = {
    // eslint-disable-next-line quote-props
    "scriptToInject": insertScript.value,
  };

  const scriptToInject = JSON.stringify(data);
  //  console.log(scriptToInject);
  xhr.send(scriptToInject);
};
xhr.onloadstart = function () {
  console.log("started");
};
xhr.onloadend = function (e) {
  console.log("ended", e.loaded);
  window.location.reload(true);
};
// eslint-disable-next-line func-names
window.onload = function () {
  // fetch scripts
  fetch("/getinjectedscripts", {
    method: "GET",
  })
    .then((res) => {
      if (res.ok) return res.json();
    }).then((data) => {
    // loop over the data received from the server and inject in the header and scripts section.
      // const keys = Object.keys(data);
      console.log(data);
      for (const i in data) {
        // console.log(data[i].url)
        // build script
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = data[i].url;
        document.querySelector("head").insertAdjacentElement("beforeend", script);
      }
    });
};
*/
// saving progress ui

const load = {
  remove() {
    const parentnode = document.querySelector(".viewport");
    parentnode.parentElement.removeChild(parentnode);
  },
  start: () => {
    const parentviewport = document.querySelector("body");
    const viewPort = document.createElement("div");
    const spinner = document.createElement("div");
    viewPort.className = "viewport";
    spinner.className = "spinner";
    viewPort.appendChild(spinner);
    parentviewport.appendChild(viewPort);
  },
  end() {
    const checkmark = document.createElement("div");
    checkmark.className = "checkmark";
    const parentnode = document.querySelector(".viewport");
    const chilnode = parentnode.firstChild;
    parentnode.replaceChild(checkmark, chilnode);
    setTimeout(() => { this.remove(); }, 1000);
  },
  error: () => {
    const error = document.createElement("div");
    error.className = "error";
    const servererror = document.createElement("span");
    servererror.innerText = "Server Error.";
    const crossmark = document.createElement("span");
    crossmark.className = "crossmark";
    error.appendChild(crossmark);
    error.appendChild(servererror);
    const parentnode = document.querySelector(".viewport");
    const chilnode = parentnode.firstChild;
    parentnode.replaceChild(error, chilnode);
    setTimeout(() => { this.remove(); }, 1000);
  },
};

function sendPostRequest(body, route) {
  const xhr = new XMLHttpRequest();

  // we open xhr here so that it can be used anytime on `click` event

  xhr.open("POST", route, true);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-type", "application/json");

  const content = JSON.stringify(body);
  xhr.send(content);

  xhr.onloadstart = function () {
    // console.log(`Loaded ${xhr.status} ${xhr.response}`);
    // progressBar.value = 0;
    // percentile.innerText = "0%";

    // start progress overlay
    load.start();
  };

  xhr.onloadend = function (e) {
    // progressBar.value = e.loaded;
    // percentile.innerText = "Published!";
    /* Swal.fire(
      'Published'
    ); */
    // end progress overlay
    console.log(e);
    // stopSavingProgress();
    // window.location.reload(true);
    // const spinnertext = document.querySelector(".spinner");
    load.end();
  };
  xhr.onprogress = function (e) {
    // console.log(`Received ${e.loaded} of ${e.total}`);
    if (e.lengthComputable) {
      // progressBar.max = e.total;
      // progressBar.value = e.loaded;
      // percentile.innerText = `${Math.floor((e.loaded / e.total) * 100)}%`;
      // continue progress overlay
      load.start();
    }
  };

  xhr.onerror = function (e) {
    console.log(e);
    /* Swal.fire(
      "Error publishing article",
    );
  }; */
    // show error
    load.error();
  };
}

// code injection
const addscript = document.querySelector("[title=\"Done\"]");

/**
 * convert a string into HTML DOM nodes
 * @param {String} str string
 * @return {Node} HTML
 *  */
function parseString(str) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, "text/html");
  return doc.head.children;
}

if (addscript) {
  addscript.onclick = function () {
    const headerscript = document.querySelector(".headerscript").value;
    const footerscript = document.querySelector(".footerscript").value;

    const scripts = [];
    const headerscriptsarr = [...parseString(headerscript)].map((child) => child.outerHTML);
    const footerscriptsarr = [...parseString(footerscript)].map((child) => child.outerHTML);
    // build scripts
    headerscriptsarr.forEach((s) => {
      const placeHeader = { script: s, placement: "header" };
      scripts.push(placeHeader);
    });
    footerscriptsarr.forEach((s) => {
      const placeFooter = { script: s, placement: "footer" };
      scripts.push(placeFooter);
    });
    sendPostRequest(scripts, "/injectcode");
  };
}

// text editor

window.pell.init({
  element: document.getElementById("editor"),
  defaultParagraphSeparator: "p",
  placeholder: "Type something...",
  onChange(html) {
    document.getElementById("html-output").textContent = html;
  },
  upload: {
    api: "photos",
  },
});

// get content and send to database
const button = document.querySelector("[title=\"Save\"]");
const feature_image = document.querySelector(".articleimagemain");
const tags = document.querySelector(".tags");

if (button) {
  button.addEventListener("click", () => {
    const pre = document.querySelector("pre");
    const title = document.getElementById("title");
    let article_title;
    let article_html;
    title.value == "" ? article_title = title.placeholder : article_title = title.value;
    pre.textContent == "" ? article_html = " " : article_html = pre.textContent;

    // eslint-disable-next-line max-len
    const feature_image_style = feature_image.currentStyle || window.getComputedStyle(feature_image, false);
    const feature_image_url = feature_image_style.backgroundImage.slice(4, -1).replace(/['"]/g, "");
    const article_feature_image = (feature_image_url.length != "" ? feature_image_url : "");
    const article_tags = tags.value;
    const data = {
      title: article_title,
      html: article_html,
      feature_image: article_feature_image,
      article_tags,
    };
    sendPostRequest(data, "/article");
  });
}
