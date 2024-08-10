//parse text to html
function parseStringToHTML(string) {
  const parser = new DOMParser();
  return parser.parseFromString(string, "text/html");
}

//Fetch Scripts
sendRequest(`GET`, `/getinjectedscripts`)
  .then((data) => {
    // loop over the data received from the server and inject in the header and footer section.
    const scripts = JSON.parse(data);
    for (const i in scripts) {
      if (scripts[i].placement === "header") {
        document
          .querySelector("head")
          .insertAdjacentElement(
            "beforeend",
            parseStringToHTML(scripts[i].script).head.firstElementChild
          );
      } else {
        document
          .querySelector("body")
          .insertAdjacentElement(
            "beforeend",
            parseStringToHTML(scripts[i].script).head.firstElementChild
          );
      }
    }
  })
  .catch((err) => {
    load.error();
    console.log(`Augh,there was an error!,${err.statusText}`);
  });
