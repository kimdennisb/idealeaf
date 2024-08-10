// code injection
const addscript = document.querySelector(".script");

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

const headerscript = document.querySelector(".headerscript");
const footerscript = document.querySelector(".footerscript");

function checkValue(e) {
  headerscript.value.trim().length != 0 || footerscript.value.trim().length != 0
    ? addscript.removeAttribute("disabled")
    : addscript.setAttribute("disabled", "");
}

headerscript.addEventListener("input", checkValue, false);
footerscript.addEventListener("input", checkValue, false);

if (addscript) {
  addscript.onclick = function () {
    const scripts = [];
    const headerscriptsarr = [...parseString(headerscript.value)].map(
      (child) => child.outerHTML
    );
    const footerscriptsarr = [...parseString(footerscript.value)].map(
      (child) => child.outerHTML
    );
    // build scripts
    headerscriptsarr.forEach((s) => {
      const placeHeader = { script: s, placement: "header" };
      scripts.push(placeHeader);
    });
    footerscriptsarr.forEach((s) => {
      const placeFooter = { script: s, placement: "footer" };
      scripts.push(placeFooter);
    });
    sendRequest("POST", "/injectcode", scripts)
      .then((uploadedscripts) => {
        load.end();
      })
      .catch((err) => {
        load.error();
        console.log(`Augh,there was an error!,${err.statusText}`);
      });
  };
}
