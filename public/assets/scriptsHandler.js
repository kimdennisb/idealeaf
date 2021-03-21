/* eslint-disable func-names */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */

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
