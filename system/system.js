redirectUnauthenticatedUser();

window.onload = () => {

    getOverview(true);
    
    //Start the loading page
    document.querySelector('#loading-page > div > div').startLoading();

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

function initChangePage(btnElement, functionality, customLoading){
    const active = 'active';
    const menuBtns = document.querySelectorAll("#navigation > p");
    const pages = document.querySelectorAll("#system-content > .page");

    btnElement.addEventListener('click', () => {
        showPage('#loading-page');
        functionality();
        Array.from(menuBtns).forEach(g => g.classList.remove(active));
        if(!customLoading){
            Array.from(pages).forEach(g => g.classList.remove(active));
            btnElement.classList.add(active);
        }
        let activePage = null;
        if(btnElement.id === 'overview-link') activePage = '#overview';
        else if(btnElement.id === 'settings-link') activePage = '#settings';
        else activePage = `#system-content #household-template`;
        // else activePage = `#system-content .page[data-id='${btnElement.dataset.id}']`;
        
        if(activePage && !customLoading) document.querySelector(activePage).classList.add(active);
    });
}

function initOverviewFunctionality(res){
    //Handle user info
    const user = JSON.parse(res).user;
    const userNameElement = document.querySelector('#account-name');
    userNameElement.innerText = user.name; // + ' ' + user.surname;

    //Handle balance
    const balance = JSON.parse(res).balance;

    //Handle household data
    const households = JSON.parse(res).households;
    households.forEach(addHouseholdNavigationUI); //Add as elements

    //Handle expenses and their data
    const expenses = JSON.parse(res).expenses;

    //Browsing logic
    const overviewBtn = document.querySelector('#overview-link');
    const settingsBtn = document.querySelector('#settings-link');
    initChangePage(overviewBtn, getOverview, true);
    initChangePage(settingsBtn, getSettings, true);

    //Handle overview page
    const data = {
        header: ["Name", "Death toll"],
        rows: [
            ["San-Francisco (1906)", 1500],
            ["Messina (1908)", 87000],
            ["Ashgabat (1948)", 175000],
            ["Chile (1960)", 10000],
            ["Tian Shan (1976)", 242000],
            ["Armenia (1988)", 25000],
            ["Iran (1990)", 50000]
        ]
    };
    setupCategoryChart('.chart', data);

    //Show overview by default
    overviewBtn.classList.add('active');
    document.querySelector('#overview').classList.add('active');
}

function getOverview(initializeFunctionality) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://45.80.152.150/overview', true);
    xhr.allowJson();
    xhr.addToken();
    xhr.setStandardTimeout();
    xhr.setError();
    xhr.onload = function() {
        if((xhr.status === 200)){
            if(initializeFunctionality) 
            initOverviewFunctionality(xhr.response);
            window.localStorage.setItem("userId", JSON.parse(xhr.response).user.uid);
            showPage('#overview')
        }
    };
    xhr.send();
}

function addHouseholdNavigationUI(household) {
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
    initChangePage(pHouseholdElement, () => {}); //Click functionality

    const ulHouseholdElement = document.createElement('ul');
    household.users.forEach((user) => {
        const liHouseholdElement = document.createElement('li');
        const lastName = user.surname ? user.surname.charAt(0) : '';
        liHouseholdElement.innerHTML = '<span class="material-icons icn-mini">chevron_right</span>' + user.name + ' ' + lastName;
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
            updateSettingsUI(JSON.parse(xhr.response));
            showPage('#settings');
        }
    };
    xhr.send();
}

function updateSettingsUI(res) {
    document.querySelector('#account-name').innerText = res.user.name;

    document.querySelector('#pi-email').value = res.user.email;
    document.querySelector('#pi-name').value = res.user.name;
    document.querySelector('#pi-surname').value = res.user.surname;

    document.querySelector('#pi-income').value = res.estimatedMonthlyIncome;

    const newsletterCheckbox = document.querySelector('#pi-newsletter');

    if(res.newsletter){
        newsletterCheckbox.classList.add('active');
        newsletterCheckbox.dataset.checked = 'true';
    }

    newsletterCheckbox.addEventListener('click', () => {
        if(newsletterCheckbox.dataset.checked === 'true'){
            newsletterCheckbox.classList.remove('active');
            newsletterCheckbox.dataset.checked = 'false';
        }
        else {
            newsletterCheckbox.classList.add('active');
            newsletterCheckbox.dataset.checked = 'true';
        }
    });

    const hhContainer = document.querySelector('#settings .hh-container');
    while(hhContainer.firstChild) hhContainer.removeChild(hhContainer.firstChild);
    res.households.forEach((hh) => {
        const hhBlock = document.createElement('div');
        hhBlock.innerHTML = `
            <h4 class="hh-name">${hh.name}</h4>
            <p class="hh-id">ID: ${hh.hhid}</p>
            <label for="Room size">Room size, m²</label>
            <input type="number" class="hh-room-size" value="${hh.roomSize}">
            <span class="material-icons hh-leave">remove_circle</span>
        `;
        hhBlock.classList.add('hh-block');
        hhBlock.dataset.id = hh.hhid;
        hhBlock.querySelector('.hh-room-size').disabled = !hh.canEdit;
        if(!hh.canLeave) hhBlock.querySelector('.hh-leave').style.display = 'none';
        hhBlock.querySelector('.hh-leave').addEventListener('click', () => {
            if(hh.canLeave){
                if(confirm(`You're about to leave ${hh.name} household.\nAre you sure you intend to do so?`)){
                    leaveHousehold(hh.hhid, window.localStorage.getItem("userId"));
                }
            } 
        });
        hhContainer.appendChild(hhBlock);
    });
    
    if(res.households.length === 0){
        document.querySelector('#hh-wrapper').style.display = 'none';
    } else {
        document.querySelector('#hh-wrapper').style.display = 'block';
    }
}

function updatePersonalInfo(){
    try {
        hideError('#error-msg');

        //Gather JSON body
        const households = JSON.parse('[]');
        const hhBlocks = document.querySelectorAll('.hh-container > .hh-block');
        hhBlocks.forEach((block) => {
            households.push({
                "hhid": block.dataset.id,
                "roomSize": block.querySelector(".hh-room-size").value
            });
        });

        const json = {
            "estimatedMonthlyIncome": document.querySelector('#pi-income').value,
            "newsletter": (document.querySelector("#pi-newsletter").dataset.checked === 'true'),
            "user": {
                "name": document.querySelector("#pi-name").value,
                "surname": document.querySelector("#pi-surname").value,
                "password": document.querySelector("#pi-password").value,
                "newPassword": document.querySelector("#pi-new").value,
            },
            "households": households
        }

        const xhr = new XMLHttpRequest();
        xhr.open('PUT', 'http://45.80.152.150/personal-info', true);
        xhr.allowJson();
        xhr.addToken();
        xhr.setStandardTimeout();
        xhr.setError();
        xhr.onload = function() {
            if(xhr.status === 200){
                inform("Settings updated successfully", "success");
                updateSettingsUI(JSON.parse(xhr.response));
            }
            else if (xhr.status === 430){
                showError('#error-msg', xhr.response);
            }
            else {
                inform(xhr.response, "failure");
            }
        };
        xhr.send(JSON.stringify(json));
    } catch(err) {
        console.log(err);
        return false;
    }

    return false;
}

function loadPage(){
    const pages = document.querySelectorAll("#system-content > .page");
    Array.from(pages).forEach(g => g.classList.remove('active'));
    document.querySelector('#loading-page').classList.add('active');
}

function showPage(pageToOpen){
    const pages = document.querySelectorAll("#system-content > .page");
    Array.from(pages).forEach(g => g.classList.remove('active'));    
    document.querySelector(pageToOpen).classList.add('active');
}

function leaveHousehold(hhid, uid){
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', `http://45.80.152.150/household/${hhid}/user/${uid}`, true);
    xhr.allowJson();
    xhr.addToken();
    xhr.setStandardTimeout();
    xhr.setError();
    xhr.onload = function() {
        if(xhr.status === 200){
            getOverview();
            getSettings();
        }
        else if (xhr.status === 430){
            showError('#error-msg', xhr.response);
        }
        else {
            inform(xhr.response, "failure");
        }
    };
    xhr.send();
}