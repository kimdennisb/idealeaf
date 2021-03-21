/* eslint-disable no-restricted-globals */
/* eslint-disable func-names */
/* eslint-disable no-plusplus */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
// navigation
function openNav() {
  document.getElementById("myNav").style.width = "100%";
}

function closeNav() {
  document.getElementById("myNav").style.width = "0%";
}

const redirectHome = document.querySelector(".blog_icon");
redirectHome.onclick = function () {
  window.location.href = "/";
};

function openSearch() {
  document.getElementById("myOverlay").style.display = "block";
}

function closeSearch() {
  document.getElementById("myOverlay").style.display = "none";
  window.location.href = "/";
}

// construct URLSearchParams object instance from current URL querystring

const queryParams = new URLSearchParams(window.location.search);

// get value from search input on change
const searchBox = document.querySelector(".searchBoxPosts");
if (searchBox) {
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

function performSearch() {
  /**
   * send a fetch request to the server every time a user types a keyword
   * @returns the array of posts that the partial or fullsearch has matched.
   *remove returned elements from previous request when performing a new request
   */
  const url = window.location.href;
  const foundResults = document.querySelector(".live-search-list");
  while (foundResults.lastElementChild) {
    foundResults.removeChild(foundResults.lastElementChild);
  }
  // if parent has child nodes,set the background color to white
  if (foundResults.hasChildNodes) {
    // foundResults.style.backgroundColor = "#369";
  }
  fetch(url, {
    method: "GET",
  }).then((res) => {
    if (res.ok) return res.json();
  }).then((data) => {
    // console.log(data);
    // do something with post(s)
    // create ui for the post(s) titles
    let myString = "";
    if ((!(data.length < 1)) && (this.value !== "")) {
      data.forEach((x) => {
        myString += `<li>${x.title}</li>`;
      });
    } else if (this.value !== "") {
      myString = "<li>No matching results:(</li>";
    } else {
      myString = "<li>Key in Keywords</li>";
    }

    foundResults.insertAdjacentHTML("beforeend", myString);
  }).catch((error) => {
    console.log(error);
  });
}

// check if url has a query param and make overlay visible
if (location.href.includes("?")) {
  openSearch();
}

// check cookie if it exists
(function () {
  const { cookie } = document;
  const decodedCookie = decodeURIComponent(cookie);
  const boolean = decodedCookie.split("=")[0];
  console.log(boolean);
  if (boolean === "loggedIn") {
    // show the  links to restricted pages
    const restrictedroutes = document.querySelector(".restricted-routes");
    restrictedroutes.style.display = "block";
  } else {
    const nonrestrictedroutes = document.querySelector(".nonrestricted-routes");
    nonrestrictedroutes.style.display = "block";
  }
}());
