//Request password reset
const submitEmail = document.querySelector(".button.email");
// clear wrong password or email error or passwords do no match error
const clearMessage = document.querySelector(".clearMessage");

if (submitEmail) {
    const wrongEmailOrEmailSent = document.querySelector(".wrong-email-or-emailsent");

    submitEmail.onclick = function() {
        const email = document.querySelector("input[name='email']").value;
        const message = document.querySelector(".message");
        sendRequest(`POST`, `/forgot-password`, { "email": email })
            .then((res) => {
                if (res.ok) return res.json();
            })
            .then((data) => {
                wrongEmailOrEmailSent.style.display = "block";
                message.textContent = "Email sent to the address.";
                load.end();
            })
            .catch((err) => {
                wrongEmailOrEmailSent.style.display = "block";
                message.textContent = "Email does not exist.";
                load.end();
            });
    }

    clearMessage.onclick = function() {
        wrongEmailOrEmailSent.style.display = "none";
    }
}