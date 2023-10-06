// saving progress and error ui

const load = {
  createLoaderView() {
    const loaderView = document.createElement("div");
    loaderView.className = "loaderview";
    return loaderView;
  },
  removeLoaderView() {
    const parentnode = document.querySelector(".loaderview");
    parentnode.parentElement.removeChild(parentnode);
  },
  start() {
    const parentviewport = document.querySelector("body");
    if (!document.querySelector(".loaderview")) {
      const loaderView = this.createLoaderView();
      const spinner = document.createElement("div");
      spinner.className = "spinner";
      loaderView.appendChild(spinner);
      parentviewport.appendChild(loaderView);
    }
  },
  end() {
    const checkmark = document.createElement("div");
    checkmark.className = "checkmark";
    const parentnode = document.querySelector(".loaderview");
    const chilnode = parentnode.firstChild;
    parentnode.replaceChild(checkmark, chilnode);
    setTimeout(() => {
      this.removeLoaderView();
    }, 1000);
  },
  error() {
    const error = document.createElement("div");
    error.className = "error";
    const servererror = document.createElement("span");
    servererror.innerText = "Server Error.";
    const crossmark = document.createElement("span");
    crossmark.className = "crossmark";
    error.appendChild(crossmark);
    error.appendChild(servererror);
    const parentnode = document.querySelector(".loaderview");
    if (parentnode) {
      const chilnode = parentnode.firstChild;
      parentnode.replaceChild(error, chilnode);
      setTimeout(() => {
        this.removeLoaderView();
      }, 1000);
    } else {
      const parentviewport = document.querySelector("body");
      parentviewport.appendChild(error);
      setTimeout(() => {
        this.removeLoaderView();
      }, 1000);
    }
  },
  reload() {
    const body = document.querySelector("body");
    if (document.querySelector(".progress") == null) {
      const progress = document.createElement("div");
      progress.className = "progress";
      body.append(progress);
      //trick for transition to work,since when an element is added,reflow is needed
      setTimeout(() => (progress.style.width = "100%"), 2000);
      //remove element
      setTimeout(() => {
        progress.remove();
        window.location.reload(true);
      }, 3000);
    }
  },
};

function sendRequest(params) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    const [method, route, body, showProgressLoader = true] = [
      arguments[0],
      arguments[1],
      arguments[2],
      arguments[3],
    ];

    //if we POST something, XMLHttpRequest first uploads our data (the request body), then downloads the response
    //Order is:onloadstart->onloadstartupload->onprogressupload->onloadupload->onloadedupload->onprogress->onload->onloaded

    //DOWNLOAD EVENTS

    //Called when an XMLHttpRequest transaction starts transferring data
    xhr.onloadstart = function () {
      //console.log(`Loaded ${xhr.status} ${xhr.response}`);
      if (typeof body !== "undefined" && showProgressLoader === true) {
        load.start();
      }
    };

    //Request has completed whether successfully(after load) or unsuccessfully(after abort or error).
    xhr.onloadend = function (e) {
      //console.log(e.loaded, xhr.status);
      console.log(`onloadend`)
      if (typeof body !== "undefined") {
        if (xhr.status === 0) {
          reject({
            status: this.status,
            statusText: xhr.statusText,
          });
        } else {
          //load.end();
        }
      }
    };

    //called periodically with information when an XMLHttpRequest receives more data before success completely
    xhr.onprogress = function (e) {
      console.log(`onprogress`)
      // console.log(`Received ${e.loaded} of ${e.total}`);
      if (e.lengthComputable) {
        // progressBar.max = e.total;
        // progressBar.value = e.loaded;
        // percentile.innerText = `${Math.floor((e.loaded / e.total) * 100)}%`;
        if (typeof body !== "undefined" && showProgressLoader === true) {
          // load.start();
        }
      }
    };

    //Called when the request encounters an error
    xhr.onerror = function (e) {
      console.log(`onerror`)
      reject({
        status: this.status,
        statusText: xhr.statusText,
      });
    };

    //Called when content is successfully fetched
    xhr.onload = function () {
      console.log(`onload`)
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.responseText);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      }
    };

    //UPLOAD EVENTS(Register before send())

    xhr.upload.onloadstart = function () {
      console.log(`onloadstart-upload`)

    };
    xhr.upload.onload = function () {
      /*console.log(`Upload completed`)*/
      console.log(`onload-upload`)
    };
    xhr.upload.onloadend = function (e) {
      console.log(`onloadend-upload`)
      /*console.log(`Upload completed for either error or success`)*/
    };

    xhr.upload.onerror = function (e) {
      reject({
        status: this.status,
        statusText: xhr.statusText,
      });
    };
    xhr.upload.onprogress = function (e) { console.log(`onprogress-upload`) };

    // we open xhr here(inside event) so that it can be used anytime on `click` event
    xhr.open(method, route, true);

    //xhr.timeout = 3000;

    //Accept json response from server
    xhr.setRequestHeader("Accept", "application/json");

    if (typeof body !== "undefined") {
      if (body instanceof FormData) {
        xhr.send(body);
      } else {
        xhr.setRequestHeader("Content-Type", "application/json");
        const content = JSON.stringify(body);
        xhr.send(content);
      }
    } else {
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send();
    }
  });
}
