// read cookie
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

//side dropdown
const select = document.querySelector(".numberOfPostsOnTheFirstPage");
const dropside = document.querySelector(".dropsideOptions");
var options = document.querySelectorAll(".option");

if (select) {
    select.textContent = readCookie("numberOfPostsInFrontPage");

    select.addEventListener("click", function(e) {
        e.preventDefault();
        dropside.classList.toggle("open");
    });
}

const clickFn = function(e) {
    e.preventDefault();

    dropside.classList.toggle("open");

    select.textContent = this.textContent;
    var activeLink = document.querySelector(".option.active")

    if (activeLink) {
        activeLink.classList.remove("active");
    }

    this.classList.add("active");

    //update the number of posts per page
    sendRequest(`PUT`, `/postsperpage/update`, { "postsperpage": this.textContent })
        .then((updatedUser) => {
            load.end();
            //window.location.reload();
        })
        .catch((err) => {
            load.error();
        })
}

for (let i = 0; i < options.length; i++) {
    options[i].addEventListener("mousedown", clickFn, false);
}