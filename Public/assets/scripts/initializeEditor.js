// text editor

if (typeof window.pell !== "undefined") {
    let editor = window.pell.init({
        element: document.getElementById("editor"),
        defaultParagraphSeparator: "p",
        placeholder: "Type something...",
        /*onChange(html) {
            document.getElementById("html-output").textContent = html;
        },
        upload: {
            api: "/admin/images",
        },*/
        imageUpload: {}
    });

    //window.editor = editor;

    if (window.location.href.includes("/edit")) {
        const id = window.location.href.split("/").pop();
        //sendRequest("GET", `/post/${id}`);

        //slide images to look cool
        var slideIndex = 1;
        showSlides(slideIndex);

        // next/previous controls
        function plusSlides(n) {
            showSlides(slideIndex += n);
        }
        const nextI = document.querySelector("span[class='next']");
        const prevI = document.querySelector("span[class='prev']");
        nextI ? nextI.addEventListener("click", (e) => { plusSlides(1) }) : null
        prevI ? prevI.addEventListener("click", (e) => { plusSlides(-1) }) : null

        function showSlides(n) {
            let i;
            const slides = document.querySelectorAll("figure img");
            n > slides.length ? slideIndex = 1 : null;
            n < 1 ? slideIndex = slides.length : null;
            for (i = 0; i < slides.length; i++) {
                Array.from(slides)[i].style.display = "none";
                Array.from(slides)[slideIndex - 1].style.display = "block";
            }
        }

    }

}