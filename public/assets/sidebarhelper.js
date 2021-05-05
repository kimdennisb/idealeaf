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
  (homesection.children.length < 1) ? (more.style.display = "none") : (more.style.display = "block");
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
  window.location.pathname.includes("admin") ? closeAdminNav() : closeNormalNav();
}

// register click events
function registerClickEvents(documentElem, func) {
  documentElem.forEach((item, index) => {
    if (item) {
      item.addEventListener("click", func[index]);
    }
  });
}
registerClickEvents([opennav, closenav, redirect, searchIcon],
  [openSideNav, closeSideNav, redirectHome, redirectSearch]);

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
        url = "/new";
    }
    window.location.href = url;
  }

  e.stopPropagation();
}
if (manage || settings) {
  manage.addEventListener("click", controlSection, false);
  settings.addEventListener("click", controlSection, false);
}

// construct URLSearchParams object instance from current URL querystring

const queryParams = new URLSearchParams(window.location.search);

// get value from search input on change
const searchBox = document.querySelector(".searchPosts");
if (searchBox) {
  // eslint-disable-next-line prefer-destructuring
  if (window.location.search) { searchBox.value = window.location.search.split("=")[1]; }
  searchBox.oninput = function () {
    // set new or modify existing parameter value
    queryParams.set("s", this.value);
    history.replaceState(null, null, `?${queryParams.toString()}`);
    // remove all query params when input is empty
    if (this.value === "") {
      history.replaceState(null, "", location.href.split("?")[0]);
    }

    // eslint-disable-next-line no-use-before-define
    performSearch();
  };
}

if (window.location.search) {
  // eslint-disable-next-line no-use-before-define
  performSearch();
}
const posts = [];
function performSearch() {
  /**
   * @description - send a fetch request to the server every time a user types a keyword
   * @returns the array of posts that the partial or fullsearch has matched.
   *remove returned elements from previous request when performing a new request
   */
  const url = `/getsearch${window.location.search}`;
  const widget = document.querySelector(".showwidget");
  const spinner = document.querySelector("#spinner");
  widget.innerHTML = "";
  spinner.removeAttribute("hidden");

  fetch(url, {
    method: "GET",
  }).then((res) => {
    if (res.ok) return res.json();
  }).then((data) => {
    spinner.setAttribute("hidden", "");

    if ((!(data.length < 1)) && (this.value !== "")) {
      data.forEach((el) => {
        const maindiv = document.createElement("div");
        const childdiv = document.createElement("div");
        const a = document.createElement("a");
        childdiv.className = "article_title onlytext";
        const href = el.title.split(" ").join("-");
        a.href = `/article/${href}`;
        a.target = "_self";
        a.textContent = el.title;
        childdiv.appendChild(a);
        maindiv.appendChild(childdiv);
        widget.appendChild(maindiv);
      });
    } else {
      const maindiv = document.createElement("div");
      const childdiv = document.createElement("div");
      const span = document.createElement("span");
      span.textContent = "No matching results:(";
      childdiv.appendChild(span);
      maindiv.appendChild(childdiv);
      widget.appendChild(maindiv);
    }
  }).catch((error) => {
    console.log(error);
  });
}

const accessText = document.querySelector(".accessText");
function toggleAccessHelper(elem, state, target, textNode) {
  const a = document.createElement("a");
  a.href = state;
  a.target = target;
  a.innerText = textNode;
  if (elem) {
    elem.appendChild(a);
  }
}

// check cookie if it exists
(function () {
  const { cookie } = document;
  const decodedCookie = decodeURIComponent(cookie);
  const boolean = decodedCookie.split("=")[0];
  // console.log(boolean);
  if (boolean === "loggedIn") {
    // make toggle access be /logout
    toggleAccessHelper(accessText, "/logout", "_self", "logout");
  } else {
    // make toggle access be /login
    toggleAccessHelper(accessText, "/signin", "_self", "login");
  }
}());

(function () {
  const iconX = document.querySelector(".site_icon");
  const icon = document.querySelector("#group");
  const box = icon.getBBox();
  iconX.setAttribute("width", box.width);
  iconX.setAttribute("height", box.height);
  const view = `0 0 ${box.width} ${box.height}`;
  iconX.setAttribute("viewBox", view);
}());

const toggleAccess = document.querySelector(".accessicon");
if (toggleAccess) {
  toggleAccess.onclick = function () {
    accessText.style.visibility = accessText.style.visibility !== "visible" ? "visible" : "hidden";
  };
}
