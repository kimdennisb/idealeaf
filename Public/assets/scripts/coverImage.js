//

const addEventListener = function addEventListener(parent, type, listener) {
  return parent.addEventListener(type, listener);
};
const queryElementByClassName = function queryElementByClassName(classname) {
  return document.querySelector(`.${classname}`);
};
const queryElementByIdName = function queryElementByIdName(idname) {
  return document.querySelector(`#${idname}`);
};

const settingsicon = queryElementByClassName("settingsicon");
const articlesettings = queryElementByClassName("article-settings");
const editorinnersettings = queryElementByClassName("editor-inner-settings");

addEventListener(settingsicon, "click", function (e) {
  articlesettings.classList.toggle("open");
  this.classList.toggle("open");
  editorinnersettings.classList.toggle("open");
});

const articleimage = queryElementByClassName("feature_image");
const featureimage = queryElementByClassName("coverimage");
const imageinputtext = queryElementByClassName("feature_image_input_text");
const aria_label = queryElementByClassName("feature_image_aria-label");
const removefeatureimage = queryElementByClassName("remove_feature_image");
removefeatureimage.classList.add("close");

//avoid cover image being hidden in the edit window
if (featureimage.src.includes("/image") || featureimage.src.includes("blob")) {
  removefeatureimage.classList.remove("close");
  imageinputtext.classList.add("close");
  featureimage.classList.remove("hide");
}

addEventListener(
  queryElementByIdName("articleimageinput"),
  "change",
  async (e) => {
    const image = e.target.files[0];
    const fd = new window.FormData();
    fd.append("articleimage", image);

    const url = URL.createObjectURL(image);
    const alt = image.name;
    featureimage.src = url;
    featureimage.alt = alt;

    removefeatureimage.classList.remove("close");
    imageinputtext.classList.add("close");
    featureimage.classList.remove("hide");
  }
);

addEventListener(removefeatureimage, "click", function () {
  this.classList.add("close");
  imageinputtext.classList.remove("close");
  featureimage.classList.add("hide");
  featureimage.src = "";
  featureimage.alt = "";
});

//convert image files to base64
//returns object i.e {filename, promise of base64}.
async function fileListToBase64(file) {
  function getBase64(file) {
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = (ev) => {
        resolve(ev.target.result);
      };
      reader.readAsDataURL(file);
    });
  }
  const filename = file.name.split(".")[0];
  const base64 = await getBase64(file);

  return {
    filename: filename,
    base64: base64,
  };
}
