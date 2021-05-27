/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
// get checkbox elements for  the posts and script sections
function selectEditRemoveAndCheckBox() {
    const checkbox = document.querySelectorAll(".checkbox");
    const checkUncheckAll = document.querySelector(".check-uncheckAll");
    const edit = document.querySelector(".edit");
    const remove = document.querySelector(".remove");
    return { checkbox, checkUncheckAll, edit, remove };
}

// delete-helper
function deleteHelper(route, id) {
    fetch(route, {
            method: "delete",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id }),
        })
        .then((res) => {
            if (res.ok) return res.json();
        })
        // eslint-disable-next-line no-unused-vars
        .then((data) => {
            window.location.reload(true);
        });
}

const edit = selectEditRemoveAndCheckBox().edit;
const remove = selectEditRemoveAndCheckBox().remove;

/*
reduce.copy and paste in console:)
const numArray = [1, 2, [3, 10, [11, 12]], [1, 2, [3, 4]], 5, 6];
  (function flattenPostsArray(data) {
    const initialValue = [];
    return data.reduce((total, value) => {

      console.log(total, value)
      return total.concat(Array.isArray(value) ? flattenPostsArray(value) : value)
    }, initialValue);
  })(numArray);*/

// get delete element and send ajax request
remove.onclick = function() {
    const select = selectEditRemoveAndCheckBox();
    const checkedPost = Array.prototype.filter.call(select.checkbox, (item) => item.checked);
    const _siblings = [];

    checkedPost.forEach((post) => {
        // console.log(post, post.id);
        const titles = document.getElementById(post.id).parentElement.nextElementSibling;
        const element = titles.firstChild.innerHTML.trim();
        _siblings.push(element);
    });

    // eslint-disable-next-line no-nested-ternary
    (this.id === "remove-post") ? deleteHelper("/delete-posts", _siblings): (this.id === "remove-user") ? deleteHelper("/delete-users", _siblings) :
        deleteHelper("/delete-scripts", _siblings);
};

// update(edit) element
if (edit) {
    edit.onclick = () => {
        const select = selectEditRemoveAndCheckBox();
        // returns a nodeList
        const checkedPost = Array.prototype.filter.call(select.checkbox, (item) => item.checked);
        // get next element sibling
        const element = document.getElementById(checkedPost[0].id).parentElement.nextElementSibling;
        const editPathname = element.firstChild.innerHTML.trim();
        //console.log(editPathname);
        // redirect to the edit page
        window.location.href = `/edit/${editPathname}`;
    };
}

// redirect to editor
const redirecttoEditor = document.querySelector(".new");
redirecttoEditor.onclick = () => { window.location.href = "/admin/new"; };

// redirect user to admin page for posts
document.querySelector(".posts").onclick = () => {
    window.location.href = "/admin/posts";
};
// redirect user to admin page for users
document.querySelector(".users").onclick = () => {
    window.location.href = "admin/users";
};

// redirect user to admin page for posts
document.querySelector(".scripts").onclick = () => {
    window.location.href = "admin/scripts";
};

// eslint-disable-next-line no-unused-vars
function openNav() {
    document.getElementById("myNav").style.width = "100%";
}

// eslint-disable-next-line no-unused-vars
function closeNav() {
    document.getElementById("myNav").style.width = "0%";
}