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

    //store script in the database
    var xhr = new XMLHttpRequest();
   
    //we open xhr here so that it can be used anytime on `click` event

    xhr.open('POST','/scriptToInject',true);
    xhr.setRequestHeader('Accept','application/json');
    xhr.setRequestHeader('Content-type','application/json');
    
    var data = {
        'scriptToInject' : insertScript.value
    }
    
    var scriptToInject = JSON.stringify(data);
    console.log(scriptToInject)
    xhr.send(scriptToInject);
}

window.onload = function(){
        
    //fetch scripts
    fetch('/getinjectedscripts',{
        method: 'GET'
    })
    .then((res)=>{
        if(res.ok) return res.json()
    }).then((data)=>{
        //loop over the data received from the server and inject in the header and scripts section.
        for(let i in data){
            //console.log(data[i].url)
            //build script
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = data[i].url;
            document.querySelector('head').insertAdjacentElement('beforeend',script);

            var label = document.createElement('label');
            label.className = 'custom-checkbox';
            var input = document.createElement('input');
            input.type = 'checkbox';
            input.id = 'checkbox';
            var span = document.createElement('span');
            span.textContent = data[i].url;
            var spanDelete = document.createElement('span');
            spanDelete.className = 'spanDelete'
            spanDelete.textContent = 'X';
            spanDelete.style.color = 'DodgerBlue';
            spanDelete.style.marginLeft = '5px';
            label.appendChild(input);
            label.appendChild(span);
            label.appendChild(spanDelete);
            document.querySelector('._injectedScripts').appendChild(label)
        }
    })
}

//collapsible
var coll = document.getElementsByClassName('collapsible-btn');
for(var i = 0;i < coll.length;i++){
    coll[i].addEventListener('click',function(){
       this.classList.toggle('active');
        var content = this.nextElementSibling;
        if(content.style.display == "none"){
            content.style.display = "block";
        }else {
            content.style.display = "none";
        }
        
    })
}
