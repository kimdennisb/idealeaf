//get checkbox element
var checkbox = document.querySelectorAll('.checkbox');

//get edit and remove elements
var edit = document.querySelector('.edit');
var remove = document.querySelector('.remove');

function handler() {
    //allow sole checking
    Array.prototype.forEach.call(checkbox,(e)=>{e.checked = false});
     this.checked = true

   if(this.checked){
     edit.style.opacity = '1';
     remove.style.opacity = '1';
     edit.style.pointerEvents = 'fill';
     remove.style.pointerEvents = 'fill';
   }
}

 for (let i in checkbox){
    // console.log(checkbox[i])
   checkbox[i].onclick = handler;
 }

 //get delete element and send ajax request
 remove.onclick = function(){
     //returns a nodeList
     var checkedPost = Array.prototype.filter.call(checkbox,(item) => { return item.checked})
    //get next element sibling
    var _sibling = document.getElementById(checkedPost[0].id).nextElementSibling.innerHTML;
    //console.log(_sibling)

    //send ajax request
    fetch('/delete',{
        method: 'delete',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({'header':_sibling})
    })
    .then((res)=>{
        if(res.ok) return res.json();
    })
    .then((data)=>{
        window.location.reload(true);
    });
 }

 //update element
 edit.onclick = function() {
       //returns a nodeList
       var checkedPost = Array.prototype.filter.call(checkbox,(item) => { return item.checked})
       //get next element sibling
       var _sibling = document.getElementById(checkedPost[0].id).nextElementSibling.innerHTML;
       console.log(_sibling)
       var editPathname = _sibling.split(' ').join('-');
       
    //redirect to the edit page
    window.location.href = `edit/${editPathname}`;
 }

 //redirect to editor
var redirecttoEditor = document.querySelector('.new');
redirecttoEditor.onclick = function() { window.location.href = '/new' }