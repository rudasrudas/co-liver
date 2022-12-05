redirectUnauthenticatedUser();

getOverview();

window.onload = () => {
    //Details
    document.querySelector(".main-logo").addEventListener('click', () => location.href = "/");

    

    // Enable alerts
    const alerts = document.createElement("div");
    alerts.id = "alerts";
    document.body.appendChild(alerts);

    //Logout functionality
    document.querySelector('#logout').addEventListener('click', () => {
        window.localStorage.setItem('userAuth', null);
        location.href = '/';
    })
}

function initChangePage(btnElement, functionality){
    const active = 'active';
    const menuBtns = document.querySelectorAll("#navigation > p");
    const pages = document.querySelectorAll("#system-content > .page");

    btnElement.addEventListener('click', () => {
        functionality();
        Array.from(menuBtns).forEach(g => g.classList.remove(active));
        Array.from(pages).forEach(g => g.classList.remove(active));
        btnElement.classList.add(active);
        let activePage = null;
        if(btnElement.id === 'overview-link') activePage = '#overview';
        else if(btnElement.id === 'settings-link') activePage = '#settings';
        else activePage = `#system-content .page[data-id=${btnElement.dataset.id}]`;
        
        if(activePage) document.querySelector(activePage).classList.add(active);
    })
}

function getOverview() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://45.80.152.150/overview', true);
    xhr.allowJson();
    xhr.addToken();
    xhr.setStandardTimeout();
    xhr.setError();
    xhr.onload = function() {
        if((xhr.status === 200)){
            
            //Handle user info
            const user = JSON.parse(xhr.response).user;
            const userNameElement = document.querySelector('#account-name');
            userNameElement.innerText = user.name + ' ' + user.surname;

            //Handle balance
            const balance = JSON.parse(xhr.response).balance;
            
            //Handle household data
            const households = JSON.parse(xhr.response).households;
            households.forEach(addHouseholdUI); //Add as elements
            
            //Handle expenses and their data
            const expenses = JSON.parse(xhr.response).expenses;

            //Browsing logic
            const overviewBtn = document.querySelector('#overview-link');
            const settingsBtn = document.querySelector('#settings-link');
            // initChangePage(overviewBtn, getOverview);
            initChangePage(settingsBtn, getSettings);

            //Show overview by default
            overviewBtn.classList.add('active');
            document.querySelector('#overview').classList.add('active');
        }
    };
    xhr.send();
}

function addHouseholdUI(household) {
    //Page
    const pages = document.querySelector('#system-content');

    const divHouseholdPage = document.createElement('div');
    divHouseholdPage.classList.add('page');
    divHouseholdPage.dataset.id = household.hhid;
    divHouseholdPage.innerHTML = `<h2 class="page-title">${household.name}</h2>`;
    pages.appendChild(divHouseholdPage);

    //Navigation
    const nav = document.querySelector('#navigation');
    const settings = document.querySelector('#settings-link');

    const pHouseholdElement = document.createElement('p');
    pHouseholdElement.dataset.id = household.hhid;
    pHouseholdElement.innerHTML = '<span class="material-icons icn">home</span> ' + household.name;
    initChangePage(pHouseholdElement); //Click functionality

    const ulHouseholdElement = document.createElement('ul');
    household.users.forEach((user) => {
        const liHouseholdElement = document.createElement('li');
        liHouseholdElement.innerHTML = '<span class="material-icons icn-mini">chevron_right</span>' + user.name + ' ' + user.surname;
        liHouseholdElement.dataset.id = user.uid;
        ulHouseholdElement.appendChild(liHouseholdElement);
    });

    nav.insertBefore(pHouseholdElement, settings);
    nav.insertBefore(ulHouseholdElement, settings);
}

function getSettings() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://45.80.152.150/personal-info', true);
    xhr.allowJson();
    xhr.addToken();
    xhr.setStandardTimeout();
    xhr.setError();
    xhr.onload = function() {
        if((xhr.status === 200)){
            const resp = JSON.parse(xhr.response);
            document.querySelector('#pi-email').value = resp.user.email;
            document.querySelector('#pi-name').value = resp.user.name;
            document.querySelector('#pi-surname').value = resp.user.surname;

            document.querySelector('#pi-income').value = resp.user.estimatedMonthlyIncome;
        }
    };
    xhr.send();
}   