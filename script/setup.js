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

XMLHttpRequest.prototype.addToken = function(){
    this.setRequestHeader("x-access-token", window.localStorage.getItem('userAuth'));
}

XMLHttpRequest.prototype.allowJson = function(){   
    this.setRequestHeader("Content-Type", "application/json");
}

XMLHttpRequest.prototype.setStandardTimeout = function(loadSelector){
    this.timeout = 5000;
    this.ontimeout = function () {
        inform("Server timed out while sending a response. Please refresh and try again.", "failure");
        try{
            if(loadSelector) document.querySelector(loadSelector).stopLoading();
        } catch(err){ }
    };
}

XMLHttpRequest.prototype.setError = function(loadSelector){
    this.onerror = function () {
        inform("Failed to connect to the server. Please try again later.", "failure");
        try{
            if(loadSelector) document.querySelector(loadSelector).stopLoading();
        } catch(err){ }
    }
}

function authenticateUser(callIf, callback){
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://45.80.152.150/', true);
    xhr.allowJson();
    xhr.addToken();
    xhr.onload = function() {
        if((xhr.status === 200) === callIf) callback();
    };
    xhr.send();
}

function redirectAuthenticatedUser(){
    authenticateUser(true, () => {location.href = '/system';});
}

async function redirectUnauthenticatedUser(){
    await authenticateUser(false, () => {location.href = '/';});
}

function logOffUnauthenticated(xhr){
    if(xhr.status === 401) location.href = '/';
}