window.onload = () => {
    document.querySelector(".main-logo").addEventListener('click', () => location.href = "/");

    // Enable alerts
    const alerts = document.createElement("div");
    alerts.id = "alerts";
    document.body.appendChild(alerts);
}

function registerUser(){
    
    document.querySelector('form').startLoading();
    document.querySelector('#error-msg').textContent = '';

    const jsonBody = {
        "name": document.querySelector('#name-input').value,
        "email": document.querySelector('#email-input').value,
        "password": document.querySelector('#password-input').value
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://45.80.152.150/login', true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function() {
        if (xhr.status === 200) {
            // let res = JSON.parse(xhr.response);
            inform("Signed up successfuly!", "success");
        }
        else {
            // inform("Failed to connect to the server.\nStatus code " + xhr.status, "failure");
            document.querySelector('#error-msg').textContent = "Invalid information. Please make sure that all fields are correct and passwords match.";
            document.querySelector('#error-msg').style.animation = "pulseText 1s linear";
            setTimeout(function(){ document.querySelector('#error-msg').style.animation = ""; }, 1100);
        }

        document.querySelector('form').stopLoading();
    };
    xhr.send(JSON.stringify(jsonBody));

    return false;
}