const settingsicon = document.querySelector(".settingsicon");
const articlesettings = document.querySelector(".article-settings");
const editorinnersettings = document.querySelector(".editor-inner-settings");

settingsicon.onclick = function () {
  articlesettings.classList.toggle("open");
  editorinnersettings.classList.toggle("open");
  this.classList.toggle("open");
};

const articleimage = document.querySelector(".feature_image");
const featureimage = document.querySelector(".coverimage");
const imageinputtext = document.querySelector(".feature_image_input_text");
const aria_label = document.querySelector(".feature_image_aria-label");
const removefeatureimage = document.querySelector(".remove_feature_image");
removefeatureimage.classList.add("close");

/**
 * @description get element by classname
 * @param {String} classname
 * @returns DocumentElement
 */
function queryElementByClassName(classname) {
  return document.querySelector(`.${classname}`);
}

//avoid cover image being hidden in the edit window
if (featureimage.src.includes("/image") || featureimage.src.includes("blob")) {
  removefeatureimage.classList.remove("close");
  imageinputtext.classList.add("close");
  featureimage.classList.remove("hide");
}

document
  .querySelector("#articleimageinput")
  .addEventListener("change", async (e) => {
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
  });

removefeatureimage.onclick = function () {
  this.classList.add("close");
  imageinputtext.classList.remove("close");
  featureimage.classList.add("hide");
  featureimage.src = "";
  featureimage.alt = "";
};

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
