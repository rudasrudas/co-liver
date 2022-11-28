window.onload = () => {
    document.querySelector(".main-logo").addEventListener('click', () => location.href = "/");
    
    // Enable alerts
    const alerts = document.createElement("div");
    alerts.id = "alerts";
    document.body.appendChild(alerts);
}

function loginUser(){
    //Call login
    document.querySelector('form').startLoading();
    setTimeout(function(){ 
        document.querySelector('form').stopLoading(); 

        document.querySelector('#error-msg').textContent = "Email and/or password is incorrect. Please try again with different credentials.";
        document.querySelector('#error-msg').style.animation = "pulseText 1s linear";
        setTimeout(function(){ document.querySelector('#error-msg').style.animation = ""; }, 1100);
        inform("Logging in to the system!", "success");
    }, 5000);

    
    return false;
}