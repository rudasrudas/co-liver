document.title = 'Oliver - ' + document.title;

function hideError(errorElementSelector){
    try {
        document.querySelector(errorElementSelector).textContent = '';
    } catch(err) {
        console.log(err);
    }
}

function showError(errorElementSelector, message){
    if(!document.querySelector(errorElementSelector)){
        console.log("Error selector invalid.");
        return;
    }
    
    document.querySelector(errorElementSelector).textContent = message;
            
    document.querySelector(errorElementSelector).style.animation = "pulseText 1s linear";
    setTimeout(function(){ document.querySelector(errorElementSelector).style.animation = ""; }, 1100);
}

function authenticateUser(){
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://45.80.152.150/', true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("x-access-token", window.localStorage.getItem('userAuth'));
    xhr.onload = function() {
        console.log(xhr.status + '\n' + xhr.response);
        // if (xhr.status === 200) {
        // }
        // else {
        // }
    };
    xhr.send();
}