//navigation
function openNav() {
    document.getElementById("myNav").style.width = "100%";
}

function closeNav() {
    document.getElementById("myNav").style.width = "0%";
}

//add script
function addScript() {
 
    const popup = document.querySelector('.popup-input'),
          cancel = document.querySelector('.btn_cancel');
  
     //distinguish between resize and onclick of the buttons and show popup so the width cannot be 0
     (this.className == 'addScript') ? popup.style.display = 'block' : null;

    //get popup and window width.
    var popupWidthCenter = (popup.clientWidth / 2),
        windowCenter = (window.innerWidth  / 2),
        widthNum = (windowCenter - popupWidthCenter);

    //convert width to a percentile & parse to string
    var widthString = ((widthNum * 100) / window.innerWidth).toLocaleString();
    popup.style.left = `${widthString}%`;
    
    cancel.onclick = ()=>{ popup.style.display = 'none'; }

    return `${widthString}%`;
}

const addScriptButton = document.querySelector('.addScript');
      
addScriptButton.onclick = addScript;

//position the popup at the center on window resizing
window.onresize = function() {
    const popup = document.querySelector('.popup-input');
    popup.style.left = addScript();
}

//grab input from the add script input and insert in header
const insertScript = document.querySelector("input[type='text']"),
      saveScript = document.querySelector('.btn_save');
saveScript.onclick = ()=>{
    
    //build script
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = insertScript.value;
    document.querySelector('head').insertAdjacentElement('beforeend',script)
}

//collapsible
var coll = document.getElementsByClassName('collapsible');
for(var i = 0;i < coll.length;i++){
    coll[i].addEventListener('click',function(){
        this.classList.toggle('active');
        var content = this.nextElementSibling;
        if(content.style.display === "block"){
            content.style.display = 'none';
        }else{
            content.style.display = 'block';
        }
    })
}
