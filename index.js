window.onload = () => {
    // Enable alerts
    const alerts = document.createElement("div");
    alerts.id = "alerts";
    document.body.appendChild(alerts);
    const btnSendMessage = document.getElementById('send-message-btn');
    btnSendMessage.addEventListener("click", sendMessage);
    
}

function sendMessage(){
    console.log("test");
    console.log(document.querySelector('#email-input').value);

    
   // document.querySelector('form').startLoading();
   // document.querySelector('#error-msg').textContent = '';

    const jsonBody = {
        "name": document.querySelector('#name-input').value,
        "email": document.querySelector('#email-input').value,
        "text": document.querySelector('#message-input').value
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost/send-message', true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function() {
        if (xhr.status === 200) {
            // let res = JSON.parse(xhr.response);
            inform("Message was sent successfuly!", "success");
        }
        else {
            // inform("Failed to connect to the server.\nStatus code " + xhr.status, "failure");
            // document.querySelector('#error-msg').textContent = "Invalid information. Please make sure that all fields are correct and passwords match.";
            // document.querySelector('#error-msg').style.animation = "pulseText 1s linear";
            // setTimeout(function(){ document.querySelector('#error-msg').style.animation = ""; }, 1100);
            inform("Faillll", "failure");

        }

        //document.querySelector('form').stopLoading();
    };
    xhr.send(JSON.stringify(jsonBody));

    return false;
}

