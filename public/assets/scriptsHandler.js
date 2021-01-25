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
  (this.className === "addScript'") ? popup.style.display = "block" : null;

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
const addScriptButton = document.querySelector(".addScript");
addScriptButton.onclick = addScript;

// position the popup at the center on window resizing
// eslint-disable-next-line func-names
window.onresize = function () {
  const popup = document.querySelector(".popup-input");
  popup.style.left = addScript();
};

// grab input from the add script input and insert in header
const insertScript = document.querySelector("input[type='text']");
const saveScript = document.querySelector(".btn_save");
saveScript.onclick = () => {
  // store script in the database
  const xhr = new XMLHttpRequest();

  // we open xhr here so that it can be used anytime on `click` event

  xhr.open("POST", "/scriptToInject", true);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-type", "application/json");

  const data = {
    // eslint-disable-next-line quote-props
    "scriptToInject": insertScript.value,
  };

  const scriptToInject = JSON.stringify(data);
  console.log(scriptToInject);
  xhr.send(scriptToInject);
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

        const label = document.createElement("label");
        label.className = "custom-checkbox";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = "checkbox";
        const span = document.createElement("span");
        span.textContent = data[i].url;
        const spanDelete = document.createElement("span");
        spanDelete.className = "spanDelete";
        spanDelete.textContent = "X";
        spanDelete.style.color = "DodgerBlue";
        spanDelete.style.marginLeft = "5px";
        label.appendChild(input);
        label.appendChild(span);
        label.appendChild(spanDelete);
        document.querySelector("._injectedScripts").appendChild(label);
      }
    });
};

// collapsible
const coll = document.getElementsByClassName("collapsible-btn");
// eslint-disable-next-line no-plusplus
for (let i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function () {
    this.classList.toggle("active");
    const content = this.nextElementSibling;
    if (content.style.display === "none") {
      content.style.display = "block";
    } else {
      content.style.display = "none";
    }
  });
}
