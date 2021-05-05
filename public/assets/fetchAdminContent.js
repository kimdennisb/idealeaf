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
