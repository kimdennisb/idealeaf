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

/*
if (window.location.pathname.includes("/forgot-password")) {
    document.querySelector(".form").addEventListener("submit", (event) => {
        event.preventDefault();
        fetch(event.target.action, {
            method: "POST",
            body: new URLSearchParams(new FormData(event.target)),
        }).then((resp) => resp.json()).then((body) => {
            document.querySelector(".wrong-email-or-emailsent").style.display = "block";
            document.querySelector(".message").textContent = "Email sent to the address.";
        }).catch((err) => {
            document.querySelector(".wrong-email-or-emailsent").style.display = "block";
            document.querySelector(".message").textContent = "Email does not exist.";
        });
    });
    document.querySelector(".clearMessage").onclick = function() {
        document.querySelector(".wrong-email-or-emailsent").style.display = "none";
    }
}*/

// let me not delete this:) ~ for learning purposes
/*  const image = await jimp.read(photo.buffer);
          image.resize(size, jimp.AUTO);
          image.quality(90);
          image.getBuffer(jimp.AUTO, (err, buffer) => {
            if (err) console.error(err);
            console.log(buffer);
            const photoName = `${photo.originalname}-${size}`;
            const returnedURL = storeImage({ photoName, buffer });
            // eslint-disable-next-line prefer-template
            imagesrcsets.push("/image/" + returnedURL + " " + size + "w");
          }); */

/*const privateKey = fs.readFileSync(path.join(__dirname, "cert", "privkey.pem"), "utf-8");
const certificate = fs.readFileSync(path.join(__dirname, "cert", "cert.pem"), "utf-8");
const ca = fs.readFileSync(path.join(__dirname, "cert", "chain.pem"), "utf-8");

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};*/

//const httpServer = http.createServer(app);
//const httpsServer = https.createServer(credentials, app);

/*httpServer.listen(80, () => {
    console.log('HTTP Server running on port 80');
});*/

/*
httpsServer.listen(port, () => {
    console.log(`HTTPS Server running on port ${port}`);
});
*/

/*
const httpsServer = https.createServer({
        key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
        cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
    },
    app);*/
/*
const accessText = document.querySelector(".accessText");

function toggleAccessHelper(elem, state, target, textNode) {
    const a = document.createElement("a");
    a.href = state;
    a.target = target;
    a.innerText = textNode;
    if (elem) {
        elem.appendChild(a);
    }
}*/

// check cookie if it exists
/*(function() {
    
     * can't remove the code,it's genius:)

    const cookies = document.cookie;
    const cookiesArray = cookies.split(";");
    const cookieObject = cookiesArray.reduce((valuepair, value) => {

        const [key, pair] = value.trim().split("=");
        return ({...valuepair, [key]: pair })
    }, {});
    if (cookieObject.loggedIn) {
        // make toggle access be /logout
        toggleAccessHelper(accessText, "/logout", "_self", "logout");
    } else {
        // make toggle access be /login
        toggleAccessHelper(accessText, "/signin", "_self", "login");
    }
}());*/
/*
    // eslint-disable-next-line max-len
    const feature_image_style = feature_image.currentStyle || window.getComputedStyle(feature_image, false);
    const feature_image_url = feature_image_style.backgroundImage.slice(4, -1).replace(/['"]/g, "");
    const article_feature_image = (feature_image_url.length != "" ? feature_image_url : "");
    const article_feature_image_alt = feature_image_altName.ariaLabel;*/
     /* else if (
                e.keyCode == 8 &&
                document.getSelection().anchorNode.nodeName == "FIGURE"
              ) {
                //console.log(`Reached,${document.getSelection().anchorNode}`);
                document.getSelection().anchorNode.remove();
              } */ /*else if (
                e.keyCode == 8 &&
                document.getSelection().anchorNode.parentNode.parentNode
                  .nodeName == "FIGURE"
              ) {
                document
                  .getSelection()
                  .anchorNode.parentNode.parentNode.remove();
              }*/ /* else if (
                e.keyCode == 8 &&
                document.getSelection().getRangeAt(0).commonAncestorContainer
                  .parentNode.parentNode.nodeName == "FIGURE"
              ) {
                document
                  .getSelection()
                  .getRangeAt(0)
                  .commonAncestorContainer.parentNode.parentNode.remove();
              }*/

              
    //remove whole figure element if image(s) are/is deleted
    /*contentEditable.addEventListener("keydown", (event) => {
      if (event.keyCode === 8) {
        //event.prevenDefault();
        const node = document.getSelection().anchorNode;
        console.log(node,node == "figure");
      }
    });*/
                  /*console.log(
                document.getSelection().anchorNode.nodeName == "FIGURE",
                document.getSelection().anchorNode.parentNode.parentNode
                  .nodeName == "FIGURE",
                document.getSelection().getRangeAt(0).commonAncestorContainer
                  .parentNode.parentNode.nodeName == "FIGURE"
              );
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
*/