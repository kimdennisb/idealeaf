//Set new password
const submitPassword = document.querySelector(".button.password");
const clearMessage = document.querySelector(".message");
if (submitPassword) {
    const passwordResetDialog = document.querySelector(".passwordreset");
    const passwordresetMessage = document.querySelector(".message");
    const URL = window.location.pathname;

    submitPassword.onclick = function() {
        const newPassword = document.querySelector("input[name='password']").value;
        const confNewPassword = document.querySelector("input[name='passwordConf']").value;

        if (newPassword === confNewPassword) {
            sendRequest(`POST`, URL, { "password": newPassword })
                .then((res) => {
                    if (res.ok) return res.json();
                })
                .then((data) => {
                    passwordResetDialog.style.display = "block";
                    passwordresetMessage.innerHTML = `Password reset succesfull.<a href="/signin">Signin ?</a>`;
                    load.end();
                })
                .catch((err) => {
                    load.error();
                });
        } else {
            passwordResetDialog.style.display = "block";
            passwordresetMessage.innerHTML = `Passwords do not match</a>`
        }
    }

    clearMessage.onclick = function() {
        passwordResetDialog.style.display = "none";
    }
}