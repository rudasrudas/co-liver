redirectAuthenticatedUser();

window.onload = () => {
    document.querySelector(".main-logo").addEventListener('click', () => location.href = "/");
    
    // Enable alerts
    const alerts = document.createElement("div");
    alerts.id = "alerts";
    document.body.appendChild(alerts);

    //Passed message
    const message = new URLSearchParams(window.location.search).get('message');
    const msgType = new URLSearchParams(window.location.search).get('type');
    if(message) {
        inform(message, msgType);
    }
}

function loginUser(){

    hideError('#error-msg');

    const jsonBody = {
        "email": document.querySelector('#email-input').value,
        "password": document.querySelector('#password-input').value
    }

    let passInput = document.querySelector('#password-input');
    let clearPass = () => {
        passInput.value = '';
    }

    //Validating form inputs
    if(!jsonBody.email){
        clearPass();
        showError('#error-msg', "Email is mandatory");
    } else if(!jsonBody.email.includes('@')){
        clearPass();
        showError('#error-msg', "Email is invalid");
    } else if(!jsonBody.password){
        clearPass();
        showError('#error-msg', "Password is mandatory");
    } else {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://45.80.152.150/login', true);
        xhr.allowJson();
        xhr.addToken();
        xhr.setStandardTimeout();
        xhr.onload = function() {
            if (xhr.status === 200) {
                window.localStorage.setItem('userAuth', JSON.parse(xhr.response).token);
                location.href = `/system`;
            }
            else if(xhr.status === 400){
                showError('#error-msg', xhr.response);
            }
            else {
                clearPass();
                inform("Unknown error occured while trying to reach the server. Please try again later", "failure");
            }
    
            document.querySelector('form').stopLoading();
        };
        xhr.send(JSON.stringify(jsonBody));
        document.querySelector('form').startLoading();
    }

    return false;
}