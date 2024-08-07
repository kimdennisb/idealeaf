/* eslint-disable no-restricted-globals */
/* eslint-disable func-names */
/* eslint-disable no-plusplus */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */

// navigation
const redirect = document.querySelector(".site_icon");
const searchIcon = document.querySelector(".search_icon");
const opennav = document.querySelector(".open_icon");
const closenav = document.querySelector(".closenav");
const manage = document.querySelector("#manage");
const settings = document.querySelector("#settings");
const more = document.querySelector(".bottom-toolbar");
const homesection = document.querySelector("section");

if (more) {
  homesection.children.length < 1
    ? (more.style.display = "none")
    : (more.style.display = "block");
}

function openNormalNav() {
  document.getElementById("myNav").style.width = "100%";
}

function closeNormalNav() {
  document.getElementById("myNav").style.width = "0%";
}

function redirectHome() {
  window.location.href = "/";
}

function redirectSearch() {
  window.location.href = "/search";
}

// open and close admin side navbar
function openAdminNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

function closeAdminNav() {
  document.getElementById("mySidenav").style.width = "0";
}

// determine which function to open or close side nav
function openSideNav() {
  window.location.pathname.includes("admin") ? openAdminNav() : openNormalNav();
}

function closeSideNav() {
  window.location.pathname.includes("admin")
    ? closeAdminNav()
    : closeNormalNav();
}

// register click events
function registerClickEvents(documentElem, func) {
  documentElem.forEach((item, index) => {
    if (item) {
      item.addEventListener("click", func[index]);
    }
  });
}
registerClickEvents(
  [opennav, closenav, redirect, searchIcon],
  [openSideNav, closeSideNav, redirectHome, redirectSearch]
);

function controlSection(e) {
  if (e.target !== e.currentTarget) {
    const clickedItem = e.target.closest("div").className;

    let url;
    switch (clickedItem) {
      case "posts":
        url = "/admin/posts";
        break;
      case "users":
        url = "/admin/users";
        break;
      case "scripts":
        url = "/admin/scripts";
        break;
      case "codeinjection":
        url = "/admin/codeinjection";
        break;
      default:
        url = "/admin/new";
    }
    window.location.href = url;
  }

  e.stopPropagation();
}
if (manage || settings) {
  manage.addEventListener("click", controlSection, false);
  settings.addEventListener("click", controlSection, false);
}

//holds data in the /search window
const widget = document.querySelector(".showwidget");

const spinner = document.querySelector("#spinner");

//holds data in the admin window (posts/scripts/users)
const tbody = document.getElementsByTagName("tbody")[0];

// construct URLSearchParams object instance from current URL querystring
const queryParams = new URLSearchParams(window.location.search);

// get value from search input on change
const searchBox = document.querySelector(".search");
if (searchBox) {
  if (window.location.search) {
    searchBox.value = queryParams.get("s");
  }
  searchBox.oninput = function () {
    // set new or modify existing parameter value
    queryParams.set("s", this.value);
    history.replaceState(null, null, `?${queryParams.toString()}`);

    // remove all query params when input is empty
    if (this.value === "") {
      history.replaceState(null, "", location.href.split("?")[0]);
    }

    //only perform search when input field has a value
    if (this.value !== "") {
      performSearch();
    }

  };
}

//perform searching when url already has queryparams
if (window.location.search) {
  // eslint-disable-next-line no-use-before-define
  performSearch();
}

const wrapper = document.querySelector(".paginationtext-center");

/**
 * @description sends GET request for search data or admin data
 * @returns array of data if found.
 */
async function fetchData() {
  // search URL
  const searchURL = `/getsearch${window.location.search}`;

  // fetch posts/scripts/users URL
  const pathName = window.location.pathname.split("/")[2];
  const query = new URLSearchParams(); //someday will bring a bug:(
  query.set("q", pathName);
  const adminDataURL = `/data?${query}`;

  const url = window.location.pathname.includes("/admin")
    ? adminDataURL
    : searchURL;

  let state = await fetch(url, {
    method: "GET",
  })
    .then((res) => {
      if (res.ok) return res.json();
    })
    .then((data) => {
      if (spinner) {
        spinner.setAttribute("hidden", "");
      }

      if (!(data.length < 1) && this.value !== "") {
        let state = {
          querySet: data,
          page: 1,
          dataPerPage: 4,
          window: 4,
        };
        return state;
      } else {
        if (wrapper) {
          wrapper.setAttribute("hidden", "");
        }
        const maindiv = document.createElement("div");
        const childdiv = document.createElement("div");
        const span = document.createElement("span");
        span.textContent = "No matching results:(";
        childdiv.appendChild(span);
        maindiv.appendChild(childdiv);
        if (window.location.pathname.includes("/search")) {
          widget.appendChild(maindiv);
        }
        return {};
      }
    })
    .catch((error) => {
      console.log(error);
    });
  return state;
}

function createPageButtons(pages, paginationInstance) {
  wrapper.removeAttribute("hidden");
  wrapper.innerHTML = ``;

  paginationInstance.pageButtons(pages, wrapper);

  document.querySelectorAll(".page").forEach((pageButton) => {
    pageButton.onclick = function () {
      if (widget) {
        widget.innerHTML = "";
      }
      if (tbody) {
        tbody.innerHTML = "";
      }
      paginationInstance.setPage = Number(this.value);
      buildTitles(paginationInstance);
      addCheckBoxClickEventListener();
    };
  });
}

function buildTitles(paginationInstance) {
  let data = paginationInstance.groupDataInPages();
  let myList = data.querySet;

  for (var i in myList) {
    if (window.location.pathname.includes("/search")) {
      const parentdiv = document.createElement("div");
      const childdiv = document.createElement("div");
      childdiv.classList = "article_title onlytext";
      const a = document.createElement("a");
      a.href = `/article/${myList[i]._id}`;
      a.target = "_self";
      a.textContent = myList[i].title;
      childdiv.appendChild(a);
      parentdiv.appendChild(childdiv);
      widget.appendChild(parentdiv);
    } else {
      const tr = document.createElement("tr");
      const td1 = document.createElement("td");
      const td2 = document.createElement("td");
      const td3 = document.createElement("td");
      const td4 = document.createElement("td");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.className = "checkbox";
      input.id = `select-${i}`;
      input.setAttribute("data-id", myList[i]._id);
      td1.appendChild(input);
      const label2 = document.createElement("label");
      label2.htmlFor = `select-${i}`;
      label2.textContent =
        myList[i].title ||
        myList[i].email ||
        myList[i].script ||
        myList[i].ipaddress;
      td2.appendChild(label2);
      const label3 = document.createElement("label");
      const date = new Date(myList[i].createdAt).toDateString();
      label3.htmlFor = `select-${i}`;
      label3.textContent = date;
      td3.appendChild(label3);

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);

      if (myList[i].visits) {
        const label4 = document.createElement("label");
        label4.htmlFor = `select-${i}`;
        label4.textContent = myList[i].visits;
        td4.appendChild(label4);
        tr.appendChild(td4);
      }

      tbody.appendChild(tr);
    }
  }

  createPageButtons(data.pages, paginationInstance);
}

//parameter argument is meant for search in the admin panel after whole data is fetched- filtering from the data.
//else empty parameter means data is fetched inside the function - for the the /search window
//function calls helper functions to build the UI-in this case building the titles and pagination
async function performSearch(parameter) {
  if (widget) {
    widget.innerHTML = "";
  }
  if (tbody) {
    tbody.innerHTML = "";
  }

  if (spinner) {
    spinner.removeAttribute("hidden");
  }

  let stateX = await fetchData();

  let state = typeof parameter == "undefined" ? stateX : parameter;

  const paginate = new Paginate(state.querySet, 2);

  if (Object.entries(state).length > 1) {
    buildTitles(paginate);
    addCheckBoxClickEventListener();
  }
}

if (
  window.location.pathname.includes("/admin") &&
  !window.location.pathname.includes("/admin/new") &&
  !window.location.pathname.includes("/admin/edit")
) {
  performSearch();
}

/**
 * live search posts/scripts/users in admin(does not use MongoDB full textSearch)
 */

if (
  window.location.pathname.includes("/admin") &&
  !window.location.pathname.includes("/admin/new") &&
  !window.location.pathname.includes("/admin/edit")
) {
  (async function () {
    const input = document.querySelector(".searchBox");

    const stateX = await fetchData();
    input.addEventListener("keyup", (ev) => {
      const text = ev.target.value;
      const pat = new RegExp(text, "i");
      let matchingsearch = stateX.querySet.filter((el) => {
        return pat.test(el.title || el.email || el.script);
      });
      // mutate object(creates a copy)
      const state = Object.assign({}, stateX, { querySet: matchingsearch });
      performSearch(state);
    });
  })();
}

function selectEditRemoveAndCheckBox() {
  const checkbox = document.querySelectorAll(".checkbox");
  const checkUncheckAll = document.querySelector(".check-uncheckAll");
  const edit = document.querySelector(".edit");
  const remove = document.querySelector(".remove");
  if (edit) {
    return { checkbox, checkUncheckAll, edit, remove };
  } else {
    return { checkbox, checkUncheckAll, remove };
  }
}

// variable to toggle between chooseAll states
let all = false;

// check all the checkboxes
function checkAll() {
  const select = selectEditRemoveAndCheckBox();
  /**
   *when we check all checkboxes,make the edit button unclickable and remove button clickable
   */
  if (select.edit) {
    select.edit.style.opacity = "0.3";
    select.edit.style.pointerEvents = "none";
  }

  select.remove.style.opacity = "1";

  select.remove.style.pointerEvents = "fill";

  // console.log(checkbox, typeof checkbox);
  Array.prototype.forEach.call(select.checkbox, (e) => {
    e.checked = true;
  });
  select.checkUncheckAll.checked = true;
  // eslint-disable-next-line no-unused-vars
  all = true;
}

// uncheck all the checkboxes
function uncheckAll() {
  const select = selectEditRemoveAndCheckBox();
  /**
   *when we uncheck all checkboxes,make the edit and remove buttons unclickable
   */
  if (select.edit) {
    select.edit.style.opacity = "0.3";
    select.edit.style.pointerEvents = "none";
  }

  select.remove.style.opacity = "0.3";
  select.remove.style.pointerEvents = "none";

  // console.log(checkbox, typeof checkbox);
  Array.prototype.forEach.call(select.checkbox, (e) => {
    e.checked = false;
  });
  select.checkUncheckAll.checked = false;
  // eslint-disable-next-line no-unused-vars
  all = false;
}

function editAndRemoveButtonHandler() {
  const select = selectEditRemoveAndCheckBox();
  // check for the number of checked checkboxes,if > 1 ,allow only remove button,
  // else allow edit and remove buttons
  // if all checkboxes are not checked,make uncheckAll be true
  // and if all checked make checkAll be true
  const noOfChecked = Array.prototype.filter.call(
    select.checkbox,
    (e) => e.checked
  );
  if (noOfChecked.length > 1) {
    select.remove.style.opacity = "1";
    select.remove.style.pointerEvents = "fill";
    if (select.edit) {
      select.edit.style.pointerEvents = "none";
      select.edit.style.opacity = "0.3";
    }
  } else if (noOfChecked.length < 1) {
    select.remove.style.opacity = "0.3";
    select.remove.style.pointerEvents = "none";
    if (select.edit) {
      select.edit.style.opacity = "0.3";
      select.edit.style.pointerEvents = "none";
    }
  } else {
    select.remove.style.opacity = "1";
    select.remove.style.pointerEvents = "fill";
    if (select.edit) {
      select.edit.style.opacity = "1";
      select.edit.style.pointerEvents = "fill";
    }
  }
  // eslint-disable-next-line no-nested-ternary
  noOfChecked.length === select.checkbox.length
    ? (select.checkUncheckAll.checked = true)
    : (select.checkUncheckAll.checked = false);
}

function addCheckBoxClickEventListener() {
  const checkbox = document.querySelectorAll(".checkbox");
  const checkUncheckAll = document.querySelector(".check-uncheckAll");
  const checkboxElements = Object.values(checkbox);
  checkboxElements.map((elem) => {
    elem.addEventListener("click", () => {
      // bind the this value of the arrow function to the required object
      // handler.call(elem);
      editAndRemoveButtonHandler();
    });
    return elem;
  });
  if (checkUncheckAll) {
    checkUncheckAll.onclick = () => {
      all ? uncheckAll() : checkAll();
    };
  }
}

(function () {
  const iconX = document.querySelector(".site_icon");
  const icon = document.querySelector("#group");
  if (icon && iconX) {
    const box = icon.getBBox();
    iconX.setAttribute("width", box.width);
    iconX.setAttribute("height", box.height);
    const view = `0 0 ${box.width} ${box.height}`;
    iconX.setAttribute("viewBox", view);
  }
})();

const toggleAccess = document.querySelector(".login-logoutToggle");
if (toggleAccess) {
  const signin_signup_modal = document.querySelector(".signin-signup-modal");
  toggleAccess.onclick = function (e) {
    signin_signup_modal.style.visibility =
      signin_signup_modal.style.visibility !== "visible" ? "visible" : "hidden";
    e.stopPropagation();
  };
  document.onclick = function () {
    signin_signup_modal.style.visibility =
      signin_signup_modal.style.visibility === "visible" ? "hidden" : null;
  };
}

function setRemoveSignInSignUpModal() { }

const clearMessageSession = document.querySelector(".clearMessage");
if (clearMessageSession) {
  clearMessageSession.onclick = function () {
    document.querySelector(".wrong-password-or-email").style.display = "none";
  };
}

const parentFigure = document.querySelectorAll("[role='group']");
parentFigure.forEach((figure) => {
  function showSlides(n) {
    let i;
    const slides = figure.querySelectorAll("figure");

    n > slides.length ? (slideIndex = 1) : false;
    n < 1 ? (slideIndex = slides.length) : false;

    for (i = 0; i < slides.length; i++) {
      Array.from(slides)[i].style.display = "none";
      Array.from(slides)[slideIndex - 1].style.display = "block";
    }
  }

  //slide images to look cool
  var slideIndex = 1;
  showSlides(slideIndex);

  // next/previous controls
  function plusSlides(n) {
    showSlides((slideIndex += n));
  }

  const next = figure.querySelector("span[class='next']");
  const prev = figure.querySelector("span[class='prev']");
  next
    ? next.addEventListener("click", function (e) {
      plusSlides(1);
    })
    : null;
  prev
    ? prev.addEventListener("click", function (e) {
      plusSlides(-1);
    })
    : null;
});


