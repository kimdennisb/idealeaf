//sign up check username,email and password
const checkemail = document.querySelector("form input[name='email']");
const checkusername = document.querySelector("form input[name='username']");
const checkpassword = document.querySelector("form input[name='password']");
const checkpasswordconf = document.querySelector(
  "form input[name='passwordConf']"
);
const form = document.querySelector("form");

function removeContainedClass(element, classname) {
  element.classList.contains(classname)
    ? element.classList.remove(classname)
    : null;
}

function changeElementDisplay(element, display) {
  element.style.display === "block" ? (element.style.display = display) : null;
}

function checkUsernameEmailOrPassword() {
  const query = new URLSearchParams();
  query.set("q", `${this.name}`);
  const pathname = `/signup/check?${query.toString()}`;

  const errorMessageContainerM1 = document.querySelector(".message#m1");
  const errorMessageContainerM2 = document.querySelector(".message#m2");
  const errorMessageContainerM3 = document.querySelector(".message#m3");

  const m1 = document.querySelector(".message .m-1");
  const m2 = document.querySelector(".message .m-2");
  const m3 = document.querySelector(".message .m-3");

  if (this.name === "username" || this.name === "email") {
    removeContainedClass(this, "is-autocheck-successful");
    removeContainedClass(this, "is-autocheck-errored");
    this.classList.add("is-autocheck-loading");

    sendRequest(`POST`, pathname, { q: this.value }, false)
      .then((data) => {
        const message = JSON.parse(data);

        if (message.message === "404Username") {
          removeContainedClass(errorMessageContainerM1, "success");
          errorMessageContainerM1.classList.add("errored");
          removeContainedClass(this, "is-autocheck-successful");
          removeContainedClass(this, "is-autocheck-loading");
          this.classList.add("is-autocheck-errored");
          errorMessageContainerM1.removeAttribute("hidden");
          m1.style.display = "block";
          m1.textContent = `${this.value} is  not available`;
        }
        if (message.message === "200Username") {
          removeContainedClass(errorMessageContainerM1, "errored");
          errorMessageContainerM1.classList.add("success");
          removeContainedClass(this, "is-autocheck-errored");
          removeContainedClass(this, "is-autocheck-loading");
          this.classList.add("is-autocheck-successful");
          errorMessageContainerM1.removeAttribute("hidden");
          m1.style.display = "block";
          m1.textContent = `${this.value} is available`;
        }
        if (message.message === "InvalidUsername") {
          removeContainedClass(errorMessageContainerM1, "success");
          errorMessageContainerM1.classList.add("errored");
          removeContainedClass(this, "is-autocheck-successful");
          removeContainedClass(this, "is-autocheck-loading");
          this.classList.add("is-autocheck-errored");
          errorMessageContainerM1.removeAttribute("hidden");
          m1.style.display = "block";
          m1.textContent = `Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen`;
        }
        if (message.message === "InvalidEmail") {
          removeContainedClass(errorMessageContainerM2, "success");
          errorMessageContainerM2.classList.add("errored");
          removeContainedClass(this, "is-autocheck-successful");
          removeContainedClass(this, "is-autocheck-loading");
          this.classList.add("is-autocheck-errored");
          errorMessageContainerM2.removeAttribute("hidden");
          m2.style.display = "block";
          m2.textContent = `Email is invalid or already taken.`;
        }
        if (message.message === "200Email") {
          removeContainedClass(errorMessageContainerM2, "errored");
          errorMessageContainerM2.classList.add("success");
          removeContainedClass(this, "is-autocheck-errored");
          removeContainedClass(this, "is-autocheck-loading");
          errorMessageContainerM2.setAttribute("hidden", "");
          this.classList.add("is-autocheck-successful");
        }
      })
      .catch((error) => {});
  }

  if (
    checkpassword.value != this.value &&
    this.value != "" &&
    this.name === "passwordConf"
  ) {
    errorMessageContainerM3.classList.add("errored");
    errorMessageContainerM3.removeAttribute("hidden");
    this.classList.add("passwords-do-not-match");
    m3.style.display = "block";
    m3.textContent = `Passwords do not match.`;
  } else {
    removeContainedClass(errorMessageContainerM3, "errored");
    removeContainedClass(this, "passwords-do-not-match");
    errorMessageContainerM3.setAttribute("hidden", "");
  }

  /*Enable or disable submit buttons based on form inputs */
  const usernameInputSuccess = document.querySelector(
    "input.is-autocheck-successful[name='username']"
  );
  const emailInputSuccess = document.querySelector(
    "input.is-autocheck-successful[name='email']"
  );
  const passwordInputSuccess = document.querySelector(
    "input.passwords-do-not-match[name='passwordConf']"
  );
  const submit = document.querySelector(".button[type='submit']");

  if (
    usernameInputSuccess &&
    emailInputSuccess &&
    !passwordInputSuccess &&
    checkpassword.value != "" &&
    checkpasswordconf.value != "" &&
    submit.hasAttribute("disabled")
  ) {
    submit.removeAttribute("disabled");
  } else if (!submit.hasAttribute("disabled")) {
    submit.setAttribute("disabled", "");
  }
}

if (checkemail && checkusername && checkpasswordconf) {
  [checkemail, checkusername, checkpasswordconf].forEach(
    (formelement, index) => {
      formelement.addEventListener("input", function () {
        //console.log(this)
        checkUsernameEmailOrPassword.call(this);
      });

      formelement.addEventListener("focusout", function () {
        this.nextElementSibling.setAttribute("hidden", "");
      });

      formelement.addEventListener("focusin", function () {
        if (this.value != "" && this === document.activeElement) {
          this.nextElementSibling.removeAttribute("hidden");
        }
      });
    }
  );
}
