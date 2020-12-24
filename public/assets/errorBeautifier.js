const URL = window.location.pathname;
console.log(URL)
fetch(URL)
     .then(res=>{
         //check if response has errors
         if(res.ok){
             return res.json()
         } else {
             //Has errors, since res.json() returns a Promise,we
             //chain a then here to get the value and return the error value
             //as promise rejection so that it will go to the
             //catch handler
             return res.json().then(err => Promise.reject(err));
             //this could also be
             //reurn res.json().then(err => throw Error(err));
         }
     })
     .then(json => {
         //dispatch success
         console.log(json)
     })
     .catch(err => {
         console.log(err)
     });