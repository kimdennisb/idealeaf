document.querySelector(".form").addEventListener("submit", (event) => {
  console.log(new URLSearchParams(new FormData(event.target)))
  // event.preventDefault();
  fetch(event.target.action, {
    method: "POST",
    body: new URLSearchParams(new FormData(event.target)),
  }).then((resp) => resp.json()).then((body) => {
    console.log(body);
  }).catch((err) => {
    console.log(err);
  });
});
