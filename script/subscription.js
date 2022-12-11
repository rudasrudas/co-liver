function subscribe() {
    try{
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://45.80.152.150/newsletter', true);
        xhr.allowJson();
        xhr.setStandardTimeout('#newsletter-block');
        xhr.setError('#newsletter-block');
        xhr.onload = function() {
            if (xhr.status === 200) {
                inform("Successfully subscribed to the newsletter!", "success");
            }
            else if (xhr.status === 400){
                inform("Server failed to process the subscription. Please try again later", "failure");
            }
            else {
                inform("Unknown error occured. Server might be down.\nPlease refresh and try again later", "failure");
            }
        };
        const json = {
            "email": document.querySelector('#newsletter-input').value
        }
        xhr.send(JSON.stringify(json));
        document.querySelector('#newsletter-block').startLoading();
    } catch (err) {
        return false;
    }

    return false;
}

function unsubscribe(){
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', 'http://45.80.152.150/newsletter', true);
    xhr.allowJson();
    xhr.addToken();
    xhr.setStandardTimeout();
    xhr.onload = function() {
        if((xhr.status === 200)){
            const msg = "Unsubscribed from future newsletters";
            location.assign(`/?message=${msg}&type=success`);
        } 
        else {
            const msg = "Failed to unsubscribe from newsletter. Try again later";
            location.assign(`/?message=${msg}&type=failure`);
        }
    };
    const email = {
        "email": decodeURIComponent(new URLSearchParams(window.location.search).get('e'))
    };
    xhr.send(JSON.stringify(email));
}

function createUnsubscribeLink(email) {
    return window.location.origin + '/unsubscribe.html?e=' + encodeURIComponent(email);
}