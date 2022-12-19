function report(code) {
    let message;
    switch (code){
        case 500:
            message = "System error occured. Please refresh and try again.";
            break;
        default:
            message = "Unknown error occured. Please refresh and try again.";
            break;
    }
    alert(message, "failure");
}

function inform(message, type) {
    const types = ["success", "failure", "information"];
    if(!types.includes(type)){
        type = "information";
    }
    const hostElement = document.querySelector("#alerts");

    //Box element
    const box = document.createElement("div");
    box.classList.add("alert", type);

    //Icon element
    const img = document.createElement("img");
    img.classList.add("alert-icon");
    switch(type){
        case "success":
            img.src = "/img/icons/success-icn.svg";
            break;
        case "failure":
            img.src = "/img/icons/failure-icn.svg";
            break;
        case "information":
            img.src = "/img/icons/info-icn.svg";
            break;   
    }

    //Text element
    const text = document.createElement("p");
    text.innerText = message;

    //Close button element
    const closeBtn = document.createElement("span");
    closeBtn.classList.add("close", "material-icons");
    closeBtn.innerText = "close";
    closeBtn.addEventListener("click", () => {
        hostElement.removeChild(box);
    });

    //Populate alert box
    box.appendChild(img);
    box.appendChild(text);
    box.appendChild(closeBtn);

    setTimeout(function(){ 
        try {
            hostElement.removeChild(box); 
        } catch (err) { }
    }, 5000);

    hostElement.insertBefore(box, hostElement.firstElementChild);
}