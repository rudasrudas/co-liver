const xhr = new XMLHttpRequest();
xhr.open('POST', 'http://45.80.152.150/unsubscribe', true);
xhr.allowJson();
xhr.addToken();
xhr.setStandardTimeout();
xhr.onload = function() {
    if((xhr.status === 200)){
        const msg = "Unsubscribed from future newsletters";
        location.assign(`/?message=${msg}&type=success`);
    } 
};
const email = {
    "email": decodeURIComponent(new URLSearchParams(window.location.search).get('e'))
};
console.log(email.email);
xhr.send(JSON.stringify(email));

function createUnsubscribeLink(email) {
    return window.location.origin + '/unsubscribe.html?e=' + encodeURIComponent(email);
}