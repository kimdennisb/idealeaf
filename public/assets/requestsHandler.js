/* eslint-disable camelcase */
/* eslint-disable eqeqeq */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */

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
        setTimeout(() => { this.removeLoaderView(); }, 1000);
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
            setTimeout(() => { this.removeLoaderView(); }, 1000);
        } else {
            const parentviewport = document.querySelector("body");
            parentviewport.appendChild(error);
            setTimeout(() => { this.removeLoaderView(); }, 1000);
        }

    },
};

function sendRequest(params) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        const [method, route, body] = [arguments[0], arguments[1], arguments[2]];

        //DOWNLOAD EVENTS

        //Called when an XMLHttpRequest transaction starts transferring data
        xhr.onloadstart = function() {
            //console.log(`Loaded ${xhr.status} ${xhr.response}`);
        };

        //Request has completed whether successfully(after load) or unsuccessfully(after abort or error).
        xhr.onloadend = function(e) {
            //console.log(e.loaded, xhr.status);
            if (typeof body !== "undefined") {
                if (xhr.status === 0) {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                } else {
                    //load.end();
                }
            }
        };

        //called periodically with information when an XMLHttpRequest before success completely
        xhr.onprogress = function(e) {
            // console.log(`Received ${e.loaded} of ${e.total}`);
            if (e.lengthComputable) {
                // progressBar.max = e.total;
                // progressBar.value = e.loaded;
                // percentile.innerText = `${Math.floor((e.loaded / e.total) * 100)}%`;
                if (typeof body !== "undefined") {
                    load.start();
                }
            }
        };

        //Called when the request encounters an error
        xhr.onerror = function(e) {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };

        //Called when content is successfully fetched
        xhr.onload = function() {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.responseText);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                })
            }
        }

        //UPLOAD EVENTS(Register before send())

        xhr.upload.onloadstart = function() { /*console.log(`Upload started`)*/ };
        xhr.upload.onload = function() { /*console.log(`Upload completed`)*/ };
        xhr.upload.onloadend = function(e) { /*console.log(`Upload completed for either error or success`)*/ };

        xhr.upload.onerror = function(e) {
            reject({
                status: this.status,
                statusText: xhr.statusText
            })
        }
        xhr.upload.onprogress = function(e) {}


        // we open xhr here(inside event) so that it can be used anytime on `click` event
        xhr.open(method, route, true);

        //xhr.timeout = 3000;

        //Accept json response from server
        xhr.setRequestHeader("Accept", "application/json");

        if (typeof body !== "undefined") {
            if (body instanceof FormData) {
                xhr.send(body)
            } else {
                xhr.setRequestHeader("Content-Type", "application/json");
                const content = JSON.stringify(body);
                xhr.send(content);
            }
        } else {
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send();
        }
    })

}

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

// text editor

if (typeof window.pell !== "undefined") {
    let editor = window.pell.init({
        element: document.getElementById("editor"),
        defaultParagraphSeparator: "p",
        placeholder: "Type something...",
        /*onChange(html) {
            document.getElementById("html-output").textContent = html;
        },
        upload: {
            api: "/admin/photos",
        },*/
        imageUpload: {}
    });
    window.editor = editor;
    if (window.location.href.includes("/edit")) {
        const id = window.location.href.split("/").pop();
        sendRequest("GET", `/post/${id}`);
    }

}

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
// Use a lookup table to find the index.
const lookup = new Uint8Array(256);
for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
}

const Base64Binary = {
    encode: function(arraybuffer) {
        var bytes = new Uint8Array(arraybuffer),
            i, len = bytes.length,
            base64 = "";

        for (i = 0; i < len; i += 3) {
            base64 += chars[bytes[i] >> 2];
            base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
            base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
            base64 += chars[bytes[i + 2] & 63];
        }

        if ((len % 3) === 2) {
            base64 = base64.substring(0, base64.length - 1) + "=";
        } else if (len % 3 === 1) {
            base64 = base64.substring(0, base64.length - 2) + "==";
        }

        return base64;
    },
    decode: function(base64) {
        var bufferLength = base64.length * 0.75,
            len = base64.length,
            i, p = 0,
            encoded1, encoded2, encoded3, encoded4;

        if (base64[base64.length - 1] === "=") {
            bufferLength--;
            if (base64[base64.length - 2] === "=") {
                bufferLength--;
            }
        }

        var arraybuffer = new ArrayBuffer(bufferLength),
            bytes = new Uint8Array(arraybuffer);

        for (i = 0; i < len; i += 4) {
            encoded1 = lookup[base64.charCodeAt(i)];
            encoded2 = lookup[base64.charCodeAt(i + 1)];
            encoded3 = lookup[base64.charCodeAt(i + 2)];
            encoded4 = lookup[base64.charCodeAt(i + 3)];

            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }

        return arraybuffer;
    }
}

// get content and send to database
const button = document.querySelector(".publish");
const feature_image = document.querySelector(".coverimage");
const feature_image_altName = document.querySelector(".feature_image_aria-label");
const tags = document.querySelector(".tags");

function getEditorData() {
    const article_html = window.pell.editorHTML();
    const title = document.querySelector(".title");
    const article_title = title.value || title.placeHeader;
    const article_feature_image = feature_image.getAttribute("src");
    const article_feature_image_alt = feature_image.alt;
    /*
        // eslint-disable-next-line max-len
        const feature_image_style = feature_image.currentStyle || window.getComputedStyle(feature_image, false);
        const feature_image_url = feature_image_style.backgroundImage.slice(4, -1).replace(/['"]/g, "");
        const article_feature_image = (feature_image_url.length != "" ? feature_image_url : "");
        const article_feature_image_alt = feature_image_altName.ariaLabel;*/
    const article_tags = tags.value;
    const data = {
        title: article_title,
        html: article_html,
        feature_image: article_feature_image,
        feature_image_alt: article_feature_image_alt,
        article_tags,
    };
    return data;
}

/**
 * @param {Array} images Array
 * @returns {Array} images Array
 */
function selectImagesWithBase64AsURL(images) {
    return images.filter((image) => { return image.srcset === "" });
}

/**
 * 
 * @param {String} string 
 * @returns {HTMLDocument} HTMLDocument
 */
function parseStringToHTML(string) {
    const parser = new DOMParser();
    return parser.parseFromString(string, "text/html");
}

/**
 * 
 * @returns {Array} Array imageFile(s)
 */
function getEditorImages() {
    const editorData = getEditorData();
    //parse html
    const htmldoc = parseStringToHTML(editorData.html);
    //get images
    const postimages = htmldoc.querySelectorAll("img");
    //convert nodelist to array if images present else return empty array; 
    const arraypostimages = postimages.length === 0 ? [] : selectImagesWithBase64AsURL(Array.from(postimages));
    return arraypostimages;
}

/**
 * 
 * @param {String} imagename 
 * @returns Imagename
 */
function stripImageExtension(imagename) {
    return imagename.split(".")[0];
}

/**
 * 
 * @param {File} imagefile with base64 encoding
 * @returns File
 */
function createImageFileWithBufferFromImage(imagefile) {
    const base64 = imagefile.src.split(",")[1];
    const buffer = Base64Binary.decode(base64);
    const imageName = stripImageExtension(imagefile.alt);
    const imageType = imagefile.src.split(":")[1];
    const imageFile = new File([buffer], imageName, { type: imageType })
    return imageFile;
}

/**
 * 
 * @param {String} datasrc 
 * @param {String} alt 
 * @returns File
 */
function createImageFileWithBufferFromBase64(datasrc, alt) {
    const base64 = datasrc.split(",")[1];
    const buffer = Base64Binary.decode(base64);
    const imageName = stripImageExtension(alt);
    const imageType = datasrc.split(":")[1];
    const imageFile = new File([buffer], imageName, { type: imageType });
    return imageFile;
}

/**
 * 
 * @param {Array} imageFiles 
 * @param imageFile
 * @returns FormData
 */
function appendImageFileToFormData(args) {
    const imageFiles = args;
    const formData = new window.FormData();
    if (Array.isArray(imageFiles)) {
        imageFiles.forEach((image, index) => {
            formData.append("photo", image);
        })
    } else {
        formData.append("photo", imageFiles)
    }
    return formData;
}

const ArticleState = {
    title: "",
    html: "",
    feature_image: "",
    feature_image_alt: "",
    article_tags: "",
    setTitle: function(string) {
        this.title = string;
    },
    setHTML: function(string) {
        this.html = string;
    },
    setFeatureImage: function(string) {
        this.feature_image = string;
    },
    setFeatureImageAlt: function(string) {
        this.feature_image_alt = string;
    },
    setArticleTags: function(string) {
        this.article_tags = string;
    }
}

ArticleState.getArticleData = function() {
    const data = {
        title: this.title,
        html: this.html,
        feature_image: this.feature_image,
        feature_image_alt: this.feature_image_alt,
        article_tags: this.article_tags
    };
    return data;
}

ArticleState.saveFeatureImage = async function() {
    const { feature_image, feature_image_alt } = getEditorData();
    const imagefile = createImageFileWithBufferFromBase64(feature_image, feature_image_alt);
    const fdFeatureImage = appendImageFileToFormData(imagefile);

    await sendRequest(`POST`, `/articleimage`, fdFeatureImage)
        .then((featureimage) => {
            const { src } = JSON.parse(featureimage);
            this.setFeatureImage(src);
            this.setFeatureImageAlt(feature_image_alt);
        })

    return this;
}

ArticleState.saveEditorImages = async function() {
    const postimages = getEditorImages();
    const imagefiles = postimages.map((imagefile) => { return createImageFileWithBufferFromImage(imagefile) });
    const fdPostImages = appendImageFileToFormData(imagefiles);

    await sendRequest(`POST`, `/admin/photos`, fdPostImages)
        .then((articleimages) => {
            const imageresources = JSON.parse(articleimages);
            let editorimages = Array.from(document.querySelector("div [contenteditable=\"true\"]").getElementsByTagName("img"));
            editorimages.forEach((x, index) => {
                x.srcset = imageresources[index].srcset
                x.src = imageresources[index].src;
                x.alt = imageresources[index].alt
                x.sizes = imageresources[index].sizes;
            });

        })
    return this;
}

ArticleState.saveArticle = async function() {
    this.setTitle(getEditorData().title);
    this.setHTML(window.pell.editorHTML());
    await sendRequest(`POST`, `/article`, this.getArticleData())
        .then((uploadedArticle) => {
            load.end();
        })
        .catch((err) => {
            load.error();
        })
    return this;
}

ArticleState.updateArticle = async function() {
    this.setTitle(getEditorData().title);
    this.setHTML(window.pell.editorHTML());
    const id = window.location.href.split("/").pop().trim().toString();

    await sendRequest(`PUT`, `/update/${id}`, this.getArticleData())
        .then((updatedArticle) => {
            load.end();
        })
        .catch((err) => {
            load.error();
        })
    return this;
}

async function saveArticle_() {
    const postimages = getEditorImages();
    const { feature_image, feature_image_alt } = getEditorData();
    if (postimages.length > 0 && feature_image.length > 0 && feature_image_alt.length > 0) {
        await ArticleState.saveFeatureImage();
        await ArticleState.saveEditorImages();
        await ArticleState.saveArticle();

    } else if (postimages.length > 0) {
        await ArticleState.saveEditorImages();
        await ArticleState.saveArticle();

    } else if (feature_image.length > 0 && feature_image_alt.length > 0) {
        await ArticleState.saveFeatureImage()
        await ArticleState.saveArticle();

    } else {
        await ArticleState.saveArticle();
    }
}

async function updateArticle_() {
    const postimages = getEditorImages();
    const { feature_image, feature_image_alt } = getEditorData();
    if (postimages.length > 0 && feature_image.length > 0 && feature_image_alt.length > 0) {
        await ArticleState.saveFeatureImage();
        await ArticleState.saveEditorImages();
        await ArticleState.updateArticle();

    } else if (postimages.length > 0) {
        await ArticleState.saveEditorImages();
        await ArticleState.updateArticle();

    } else if (feature_image.length > 0 && feature_image_alt.length > 0) {
        await ArticleState.saveFeatureImage()
        await ArticleState.updateArticle();

    } else {
        await ArticleState.updateArticle();

    }
}

if (button) {
    button.addEventListener("click", async() => {

        if (window.location.href.includes("/edit")) {
            await updateArticle_();
        } else if (window.location.href.includes("/new")) {
            await saveArticle_();
        } else {

        }
    });
};

//Fetch Scripts
sendRequest(`GET`, `/getinjectedscripts`)
    .then((data) => {
        // loop over the data received from the server and inject in the header and footer section.
        const scripts = JSON.parse(data)
        for (const i in scripts) {
            if (scripts[i].placement === "header") {
                document.querySelector("head").insertAdjacentElement("beforeend", parseStringToHTML(scripts[i].script).head.firstElementChild);
            } else {
                document.querySelector("body").insertAdjacentElement("beforeend", parseStringToHTML(scripts[i].script).head.firstElementChild);
            }
        }
    })
    .catch((err) => {
        load.error();
        console.log(`Augh,there was an error!,${err.statusText}`);
    });