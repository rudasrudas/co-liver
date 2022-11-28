if (window.localStorage.getItem('userAuth')) location.href = '/system';

window.onload = () => {
    document.querySelector(".main-logo").addEventListener('click', () => location.href = "/");

    // Enable alerts
    const alerts = document.createElement("div");
    alerts.id = "alerts";
    document.body.appendChild(alerts);
}

function registerUser(){
    
    hideError('#error-msg');

    const jsonBody = {
        "name": document.querySelector('#name-input').value,
        "surname": document.querySelector('#surname-input').value,
        "email": document.querySelector('#email-input').value,
        "password": document.querySelector('#password-input').value
    }

    let passInput = document.querySelector('#password-input');
    let copyInput = document.querySelector('#repeat-input');
    let clearPass = () => {
        passInput.value = '';
        copyInput.value = '';
    }

    //Validating form inputs
    if(!jsonBody.name){
        clearPass();
        showError('#error-msg', "Name is mandatory");
    } else if(!jsonBody.surname){
        clearPass();
        showError('#error-msg', "Surname is mandatory");
    } else if(!jsonBody.email){
        clearPass();
        showError('#error-msg', "Email is mandatory");
    } else if(!jsonBody.email.includes('@')){
        clearPass();
        showError('#error-msg', "Email is invalid");
    } else if(passInput.value !== copyInput.value){
        clearPass();
        showError('#error-msg', "Passwords must match");
    }
    else {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://45.80.152.150/register', true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("x-access-token", window.localStorage.getItem('userAuth'));
        xhr.onload = function() {
            if (xhr.status === 200) {
                window.localStorage.setItem('userAuth', JSON.parse(xhr.response).token);
                let msg = 'Registered successfully. Please log in to continue.';
                location.href = `/login/?message=${msg}&type=success`;
            }
            else if(xhr.status === 409){
                clearPass();
                inform("Email is already registered.\nLog in or try using a different email.", "failure");
            }
            else if(xhr.status === 400){
                clearPass();
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