/**
 * @description important code ought not to be deleted
 */

function resizeImage(imageUrl, altName, newWidth, newHeight, onReady, onError) {
    const image = document.createElement("img");
    image.onload = function() {
        const canvas = document.createElement("canvas");
        canvas.width = newWidth;
        canvas.height = newHeight;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, newWidth, newHeight);
        try {
            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
            onReady(dataUrl, altName);
        } catch (e) {
            if (onError) {
                onError("Image saving error.");
            }
        }
    };
    image.onerror = function() {
        if (onError) {
            onError("Image loading error.");
        }
    };
    image.src = imageUrl;
};

function onReady(dataUrl, altName) {
    articleimage.style.backgroundImage = `url(${dataUrl})`;
    imagetext.classList.add("close")
    aria_label.ariaLabel = altName;
    removebackground.classList.remove("close");
}

function onError(message) {
    console.error(message);
}

/* const manage = document.querySelector("#manage");
const settings = document.querySelector("#settings");

function setURL(x) {
  window.location.hash = x;
  const { host, pathname, hash } = window.location;
  const url = `${host}/${pathname}${hash}`;
  return url;
}
function fetchAdminContent(url) {
  // fetch scripts
  fetch(url, {
    method: "GET",
  })
    .then((res) => {
      if (res.ok) { return res.json(); }
    }).then((data) => {
      console.log(data);
    });
}

function controlSection(e) {
  if (e.target !== e.currentTarget) {
    const clickedItem = e.target.closest("div").className;
    if (clickedItem == "new") {
      window.location.href = "/new";
    } else {
      const url = setURL(clickedItem);

      // fetch content
      fetchAdminContent(url);
    }
  }
  e.stopPropagation();
}
manage.addEventListener("click", controlSection, false);
settings.addEventListener("click", controlSection, false);
*/

/**
 * document.querySelector(".form").addEventListener("submit", (event) => {
    console.log(new URLSearchParams(new FormData(event.target)))
        // event.preventDefault();
    fetch(event.target.action, {
        method: "POST",
        body: new URLSearchParams(new FormData(event.target)),
    }).then((resp) => resp.json()).then((body) => {
        console.log(body);
    }).catch((err) => {
        console.log(err);
    });
});
 */