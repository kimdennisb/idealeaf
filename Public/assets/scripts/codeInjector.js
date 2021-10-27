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

if (addscript) {
    addscript.onclick = function() {
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
        sendRequest("POST", "/injectcode", scripts)
            .then((uploadedscripts) => {
                load.end();
            })
            .catch((err) => {
                load.error();
                console.log(`Augh,there was an error!,${err.statusText}`);
            })
    };
}