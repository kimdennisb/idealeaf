
function openNav() {
    document.getElementById("myNav").style.width = "100%";
}

function closeNav() {
    document.getElementById("myNav").style.width = "0%";
}
//deleting posts
function helperFunction(){
    var element=document.getElementById(this.id);
    fetch('/userAdmin',{
        method:'delete',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({'header':element.textContent})
    }).then((res)=>{
        if(res.ok) return res.json();
    }).then((data)=>{
       window.location.reload(true);
    })
 }
 
var postsList=document.getElementsByTagName('li');
for(var i=0;i < postsList.length;i++){
    var toClick=postsList[i];
    toClick.onclick=helperFunction;
}

