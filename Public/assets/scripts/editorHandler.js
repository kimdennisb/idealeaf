const chars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
// Use a lookup table to find the index.
const lookup = new Uint8Array(256);
for (var i = 0; i < chars.length; i++) {
  lookup[chars.charCodeAt(i)] = i;
}

const Base64Binary = {
  encode: function (arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
      i,
      len = bytes.length,
      base64 = "";

    for (i = 0; i < len; i += 3) {
      base64 += chars[bytes[i] >> 2];
      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += chars[bytes[i + 2] & 63];
    }

    if (len % 3 === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }

    return base64;
  },
  decode: function (base64) {
    var bufferLength = base64.length * 0.75,
      len = base64.length,
      i,
      p = 0,
      encoded1,
      encoded2,
      encoded3,
      encoded4;

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
  },
};

const returnElementFromClassName = (parent, classname) =>
  parent.querySelector(`.${classname}`);

const returnElementFromId = (parent, id) => parent.querySelector(`#${id}`);

// get content and send to database
const button = returnElementFromClassName(document, "publish");
const feature_image = returnElementFromClassName(document, "coverimage");
const feature_image_altName = returnElementFromClassName(
  document,
  "feature_image_aria-label"
);
const tags = returnElementFromClassName(document, "tags");

function getEditorData() {
  const article_html = window.pell.editorHTML();
  const title = returnElementFromClassName(document, "title");
  const article_title = title.value || title.placeholder;
  const article_feature_image = feature_image.getAttribute("src");
  const article_feature_image_alt = feature_image.alt;

  const article_tags = tags.value;

  const data = {
    title: article_title,
    html: article_html,
    feature_image: article_feature_image,
    feature_image_alt: article_feature_image_alt,
    article_tags,
  };

  //trim whitespace at the end of property strings
  Object.keys(data).forEach((k) => (data[k] = data[k].trim()));

  return data;
}

/**
 * @param {Array} images Array
 * @returns {Array} images Array
 */
function selectImagesWithConvertedImageURI(images) {
  return images.filter((image) => {
    return image.src.includes(`blob`);
  });
}

/**
 * @param {String} string
 * @returns {HTMLDocument} HTMLDocument
 */
function parseStringToHTML(string) {
  const parser = new DOMParser();
  return parser.parseFromString(string, "text/html");
}

/**
 * @returns {Array} Array imageFile(s)
 */
function getEditorImages() {
  const { html } = getEditorData();
  //parse html
  const htmldoc = parseStringToHTML(html);
  //get images
  const postimages = selectImagesWithConvertedImageURI(
    Array.from(htmldoc.querySelectorAll("img"))
  );
  //convert nodelist to array if images present else return empty array;
  const arraypostimages = postimages.length === 0 ? [] : Array.from(postimages);
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
 * @param {File} imagefile with base64 encoding.. (data:image/jpeg;base64,/95jngjfngfg..)
 * @returns File
 */
function createImageFileWithBufferFromImage(imagefile) {
  const base64 = imagefile.src.split(",")[1];
  const buffer = Base64Binary.decode(base64);
  const imageName = stripImageExtension(imagefile.alt);
  const imageType = imagefile.src.split(":")[1];
  const imageFile = new File([buffer], imageName, { type: imageType });
  return imageFile;
}

/**
 *
 * @param {String} datasrc.. is not from image file
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
 * @param {String} blob url
 * @param {String} alt
 * @returns File
 */
async function createImageFileWithBufferFromImageConvertedURI(uri, alt) {
  const imageName = stripImageExtension(alt);
  return await fetch(uri)
    .then((r) => r.blob())
    .then((blobFile) => {
      return new File([blobFile], imageName, { type: "image/jpeg" });
    });
}
/**
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
    });
  } else {
    formData.append("photo", imageFiles);
  }
  return formData;
}

const ArticleState = {
  title: "",
  html: "",
  feature_image: "",
  feature_image_alt: "",
  article_tags: "",
  setTitle: function (string) {
    this.title = string;
  },
  setHTML: function (string) {
    //sanitize html string to remove unnecessary figcaption
    const htmldoc = parseStringToHTML(string);
    const sanitizedString = htmldoc.body.innerHTML;
    this.html = sanitizedString;
  },
  setFeatureImage: function (string) {
    this.feature_image = string;
  },
  setFeatureImageAlt: function (string) {
    this.feature_image_alt = string;
  },
  setArticleTags: function (string) {
    this.article_tags = string;
  },
};

ArticleState.getArticleData = function () {
  return {
    title: this.title,
    html: this.html,
    feature_image: this.feature_image,
    feature_image_alt: this.feature_image_alt,
    article_tags: this.article_tags,
  };
};

ArticleState.saveFeatureImage = async function () {
  const { feature_image, feature_image_alt } = getEditorData();
  const imagefile = await createImageFileWithBufferFromImageConvertedURI(
    feature_image,
    feature_image_alt
  );
  const fdFeatureImage = appendImageFileToFormData(imagefile);

  await sendRequest(`POST`, `/articleimage`, fdFeatureImage)
    .then((featureimage) => {
      const { src } = JSON.parse(featureimage);
      this.setFeatureImage(src);
      this.setFeatureImageAlt(feature_image_alt);
    })
    .catch((err) => {
      load.error();
    });
  return this;
};

ArticleState.saveEditorImages = async function () {
  const postimages = getEditorImages();
  const imagefiles = await Promise.all(
    postimages.map(async (imagefile) => {
      const { src, alt } = imagefile;
      return await createImageFileWithBufferFromImageConvertedURI(src, alt);
    })
  );

  const fdPostImages = appendImageFileToFormData(imagefiles);

  await sendRequest(`POST`, `/admin/images`, fdPostImages)
    .then((articleimages) => {
      const imageresources = JSON.parse(articleimages);
      const allEditorImages = Array.from(
        document
          .querySelector('div [contenteditable="true"]')
          .getElementsByTagName("img")
      );
      let editorimages = Array.from(
        selectImagesWithConvertedImageURI(allEditorImages)
      );

      //order of placing urls does not change.It's correct!.
      editorimages.forEach((x, index) => {
        x.src = `/image/${imageresources[index].src}`;
        x.alt = imageresources[index].alt;
      });
    })
    .catch((err) => {
      load.error();
    });
  return this;
};

ArticleState.saveArticle = async function () {
  this.setTitle(getEditorData().title);
  this.setHTML(window.pell.editorHTML());
  await sendRequest(`POST`, `/article`, this.getArticleData())
    .then((uploadedArticle) => {
      load.end();
      load.reload();
    })
    .catch((err) => {
      load.error();
    });
  return this;
};

ArticleState.updateArticle = async function () {
  this.setTitle(getEditorData().title);
  this.setHTML(window.pell.editorHTML());
  const id = window.location.href.split("/").pop().trim().toString();
  console.log(this.getArticleData());
  await sendRequest(`PUT`, `/update/${id}`, this.getArticleData())
    .then((updatedArticle) => {
      load.end();
      load.reload();
    })
    .catch((err) => {
      load.error();
    });
  return this;
};

async function saveArticle_() {
  const postimages = getEditorImages();
  const { feature_image, feature_image_alt } = getEditorData();
  if (
    postimages.length > 0 &&
    feature_image.length > 0 &&
    feature_image_alt.length > 0
  ) {
    await ArticleState.saveFeatureImage();
    await ArticleState.saveEditorImages();
    await ArticleState.saveArticle();
  } else if (postimages.length > 0) {
    await ArticleState.saveEditorImages();
    await ArticleState.saveArticle();
  } else if (feature_image.length > 0 && feature_image_alt.length > 0) {
    await ArticleState.saveFeatureImage();
    await ArticleState.saveArticle();
  } else {
    await ArticleState.saveArticle();
  }
}

async function updateArticle_() {
  const postimages = getEditorImages();
  const { feature_image, feature_image_alt } = getEditorData();
  if (
    postimages.length > 0 &&
    feature_image.length > 0 &&
    feature_image_alt.length > 0
  ) {
    await ArticleState.saveFeatureImage();
    await ArticleState.saveEditorImages();
    await ArticleState.updateArticle();
  } else if (postimages.length > 0) {
    await ArticleState.saveEditorImages();
    await ArticleState.updateArticle();
  } else if (feature_image.length > 0 && feature_image_alt.length > 0) {
    await ArticleState.saveFeatureImage();
    await ArticleState.updateArticle();
  } else {
    await ArticleState.updateArticle();
  }
}

if (button) {
  button.addEventListener("click", async () => {
    if (window.location.href.includes("/edit")) {
      await updateArticle_();
    } else if (window.location.href.includes("/new")) {
      await saveArticle_();
    } else {
    }
  });
}
