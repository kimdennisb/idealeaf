/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
// get checkbox elements for  the posts and script sections
const checkbox = document.querySelectorAll(".checkbox");
// const checkboxInjectedScript = document.querySelectorAll("#checkbox");
// const checkUncheckActivator = document.querySelector(".check-uncheckActivator");
const checkUncheckAll = document.querySelector(".check-uncheckAll");

// get edit and remove elements
const edit = document.querySelector(".edit");
const remove = document.querySelector(".remove");

// variable to toggle between chooseAll states
let all = false;

// check all the checkboxes
function checkAll() {
  /**
   *when we check all checkboxes,make the edit button unclickable and remove button clickable
   */
  edit.style.opacity = "0";
  remove.style.opacity = "1";
  edit.style.pointerEvents = "none";
  remove.style.pointerEvents = "fill";

  // console.log(checkbox, typeof checkbox);
  Array.prototype.forEach.call(checkbox, (e) => { e.checked = true; });
  checkUncheckAll.checked = true;
  // eslint-disable-next-line no-unused-vars
  all = true;
}

// check all the checkboxes
function uncheckAll() {
/**
   *when we uncheck all checkboxes,make the edit and remove buttons unclickable
   */
  edit.style.opacity = "0";
  remove.style.opacity = "0";
  edit.style.pointerEvents = "none";
  remove.style.pointerEvents = "none";

  // console.log(checkbox, typeof checkbox);
  Array.prototype.forEach.call(checkbox, (e) => { e.checked = false; });
  checkUncheckAll.checked = false;
  // eslint-disable-next-line no-unused-vars
  all = false;
}

function handler() {
  // check for the number of checked checkboxes,if > 1 but < length - 1,allow only remove button,
  // else allow edit and remove buttons
  const noOfChecked = Array.prototype.filter.call(checkbox, (e) => e.checked);
  if (noOfChecked.length > 1) {
    edit.style.opacity = "0";
    remove.style.opacity = "1";
    edit.style.pointerEvents = "none";
    remove.style.pointerEvents = "fill";
  } else if (noOfChecked.length < 1) {
    edit.style.opacity = "0";
    remove.style.opacity = "0";
    edit.style.pointerEvents = "none";
    remove.style.pointerEvents = "none";
  } else {
    edit.style.opacity = "1";
    remove.style.opacity = "1";
    edit.style.pointerEvents = "fill";
    remove.style.pointerEvents = "fill";
  }
}

checkUncheckAll.onclick = () => {
  all ? uncheckAll() : checkAll();
};

const checkboxElements = Object.values(checkbox);

checkboxElements.map((elem) => {
  elem.addEventListener("click", () => {
    // bind the this value of the arrow function to the required object
    // handler.call(elem);
    handler();
  });
  return elem;
});

// delete-helper
function deleteHelper(route, element) {
  fetch(route, {
    method: "delete",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ header: element }),
  })
    .then((res) => {
      if (res.ok) return res.json();
    })
  // eslint-disable-next-line no-unused-vars
    .then((data) => {
      window.location.reload(true);
    });
}

// get delete element and send ajax request
remove.onclick = function () {
  const checkedPost = Array.prototype.filter.call(checkbox, (item) => item.checked);
  const _siblings = [];
  checkedPost.forEach((x) => {
    console.log(x, x.id);
    const titles = document.getElementById(x.id).parentElement.nextElementSibling;
    const element = titles.firstChild.innerHTML;
    _siblings.push(element);
  });
  // eslint-disable-next-line no-nested-ternary
  (this.id === "remove-post") ? deleteHelper("/delete-post", _siblings)
    : (this.id === "remove-user") ? deleteHelper("/delete-users", _siblings)
      : deleteHelper("/delete-script", _siblings);
};
// update(edit) element
edit.onclick = () => {
  // returns a nodeList
  const checkedPost = Array.prototype.filter.call(checkbox, (item) => item.checked);
  // get next element sibling
  const _sibling = document.getElementById(checkedPost[0].id).parentElement.nextElementSibling;
  const element = _sibling.firstChild.innerHTML;
  // console.log(element);
  const editPathname = element.split(" ").join("-");
  // console.log(editPathname);
  // redirect to the edit page
  window.location.href = `edit/${editPathname}`;
};

// redirect to editor
const redirecttoEditor = document.querySelector(".new");
redirecttoEditor.onclick = () => { window.location.href = "/new"; };

// redirect user to signIn or signUp page
document.querySelector(".sign-out-wrapper").onclick = () => {
  window.location.href = "/logout";
};

// redirect user to admin page for posts
document.querySelector(".posts").onclick = () => {
  window.location.href = "/admin";
};
// redirect user to admin page for users
document.querySelector(".users").onclick = () => {
  window.location.href = "/users";
};

// redirect user to admin page for posts
document.querySelector(".scripts").onclick = () => {
  window.location.href = "/scripts";
};

// eslint-disable-next-line no-unused-vars
function openNav() {
  document.getElementById("myNav").style.width = "100%";
}

// eslint-disable-next-line no-unused-vars
function closeNav() {
  document.getElementById("myNav").style.width = "0%";
}

/**
 * live search posts in admin
 */
const input = document.querySelector(".searchBox");
const table = document.getElementsByTagName("table")[0];
const items = table.rows;
input.addEventListener("keyup", (ev) => {
  const text = ev.target.value;
  const pat = new RegExp(text, "i");
  // eslint-disable-next-line no-plusplus
  for (let i = 1; i < items.length; i++) {
    const item = items[i];
    const elem = item.children.item(1);
    if (pat.test(elem.firstChild.innerHTML)) {
      item.classList.remove("hidden");
    } else {
      // console.log(item);
      item.classList.add("hidden");
    }
  }
});
