window.onload = () => {
    // Enable alerts
    const alerts = document.createElement("div");
    alerts.id = "alerts";
    document.body.appendChild(alerts);
}

function sendMessage(){
    hideError('#error-msg');

    const json = {
        "name": document.querySelector('#name-input').value,
        "email": document.querySelector('#email-input').value,
        "text": document.querySelector('#message-input').value
    }

    if (!(json.name && json.email && json.text)) showError('#error-msg', "All fields are mandatory.");
    else if (!json.email.includes('@')) showError('#error-msg', "Message has to be at least 50 characters long.");
    else if (json.text.length < 50) showError('#error-msg', "Message has to be at least 50 characters long.");
    else {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://45.80.152.150/send-message', true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function() {
            if (xhr.status === 200) {
                inform("Message was sent successfully!", "success");
            }
            else if (xhr.status === 400){
                inform("Server failed to process the message. Please try again later", "failure");
            }
            else {
                inform("Unknown error occured. Server might be down.\nPlease refresh and try again later", "failure");
            }
    
            document.querySelector('form').stopLoading();
        };
        xhr.send(JSON.stringify(json));
        document.querySelector('form').startLoading();
    }

    return false;
}

