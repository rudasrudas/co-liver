window.onload = () => {
    const btn = document.querySelector('#continue-btn');
    btn.addEventListener('click', () => {
        const jsonBody = {
            "name": document.querySelector('#name-input').value,
            "email": document.querySelector('#email-input').value,
            "password": document.querySelector('#password-input').value
        }

        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", 'http://45.80.152.150/example', true);
        xhttp.onreadystatechange = () => {
            console.log(this.responseText + "\n" + this.status);
        }
        
        xhttp.send();
    });
}