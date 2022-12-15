redirectUnauthenticatedUser();

var backupPage;

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
        // else activePage = `#expense`;
        else activePage = `#system-content #household`;
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
    households.forEach(initHouseholdNavigationUI); //Add as elements

    //Handle expenses and their data
    const expenses = JSON.parse(res).expenses;

    //Browsing logic
    const overviewBtn = document.querySelector('#overview-link');
    const addHouseholdBtn = document.querySelector('#add-household-link');
    const settingsBtn = document.querySelector('#settings-link');
    initChangePage(overviewBtn, getOverview, true);
    addHouseholdBtn.addEventListener('click', () => {
        addHouseholdBtn.popup('Add new household', `
        <form style="width: 400px" onsubmit="return joinByKey()">
            <label for="Join by key">Join by key</label>
            <div class="row gap-10">
                <input id="join-by-key" type="text" class="">
                <button class="primary">Join</button>
            </div>

            <div class="spacer-2></div>

            <h3 class="popup-title">Create new household</h3>
            <label for="name">Household name</label>
            <input id="new-hh-name" type="text" class="">
            <label for="address">Address</label>
            <input id="new-hh-address" type="text" class="">
            <button class="primary">Create</button>
        </form>
        `);
    });
    initChangePage(settingsBtn, getSettings, true);

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
        logOffUnauthenticated(xhr);
        if((xhr.status === 200)){
            if(initializeFunctionality){
                initOverviewFunctionality(xhr.response);
                initExpense(JSON.parse(xhr.response).categories);
                initHousehold();
                initSettings();
            }
            window.localStorage.setItem("userId", JSON.parse(xhr.response).user.uid);
            showPage('#overview');
        }
    };
    xhr.send();
}

function initHouseholdNavigationUI(household) {
    //Page
    const pages = document.querySelector('#system-content');

    const divHouseholdPage = document.createElement('div');
    divHouseholdPage.classList.add('page');
    divHouseholdPage.dataset.id = household.hhid;
    divHouseholdPage.innerHTML = `<h2 class="page-title">${household.name}</h2>`;
    pages.appendChild(divHouseholdPage);

    //Navigation
    const nav = document.querySelector('#navigation');
    const addHousehold = document.querySelector('#add-household-link');

    const pHouseholdElement = document.createElement('p');
    pHouseholdElement.dataset.id = household.hhid;
    pHouseholdElement.innerHTML = '<span class="material-icons icn">home</span> ' + household.name;
    initChangePage(pHouseholdElement, () => { return getHousehold(household); }, true); //Click functionality

    const ulHouseholdElement = document.createElement('ul');
    household.users.forEach(user => {
        if(user._id === household.self) return;
        const liHouseholdElement = document.createElement('li');
        const lastName = user.surname ? user.surname.charAt(0) : '';
        liHouseholdElement.innerHTML = '<span class="material-icons icn-mini">chevron_right</span>' + user.name + ' ' + lastName;
        liHouseholdElement.dataset.id = user._id;
        ulHouseholdElement.appendChild(liHouseholdElement);
    });

    nav.insertBefore(pHouseholdElement, addHousehold);
    nav.insertBefore(ulHouseholdElement, addHousehold);
}

function getSettings() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://45.80.152.150/personal-info', true);
    xhr.allowJson();
    xhr.addToken();
    xhr.setStandardTimeout();
    xhr.setError();
    xhr.onload = function() {
        logOffUnauthenticated(xhr);
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

    document.querySelector('#pi-newsletter').setCheckbox(res.newsletter);

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

function initSettings(){
    document.querySelector('#pi-newsletter').initCheckbox();
}

function initHousehold(){
    initPopups();
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
            "newsletter": document.querySelector("#pi-newsletter").getCheckbox(),
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
            logOffUnauthenticated(xhr);
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
        logOffUnauthenticated(xhr);
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

function sendInvite(){
    try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `http://45.80.152.150/join/household/${hhid}/user/${uid}`, true);
        xhr.allowJson();
        xhr.addToken();
        xhr.setStandardTimeout();
        xhr.setError();
        xhr.onload = function() {
            logOffUnauthenticated(xhr);
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
    } catch(err) { }
    return false;
}

function getHousehold(household){
    showPage('#loading-page');
    backupPage = '#household';

    const hh = document.querySelector('#household');

    //Setup Invite button
    hh.querySelector('#hh-invite-user').addEventListener('click', () => {
        hh.popup(`Invite new user to ${household.name}`, `
        <form style="width: 400px" onsubmit="return sendInvite()">
            <label for="Join key">Join key</label>
            <h2 class="join-key-txt">${household.join_key}</h2>
            <div class="spacer"></div>
            
            <label for"Email to invite">Email to invite</label>
            <input id="hh-invite-email" type="email" class="">
            <div class="spacer"></div>
            <button class="primary">Send invite</button>
        </form>
        `);
    });

    //Setup new expense buttons
    hh.querySelector('.new-exp-rec').addEventListener('click', () => fillNewExpense(household, true));
    hh.querySelector('.new-exp').addEventListener('click', () => {
        fillNewExpense(household, false);
    });

    //Setup name
    hh.querySelector('.page-title').innerText = household.name;

    showPage('#household');
}

function fillNewExpense(household, recurringByDefault){
    showPage('#loading-page');

    const exp = document.querySelector('#expense');

    //PREFILL FORM

    //Household data
    if(household){
        exp.querySelector('#exp-household').value = household.name;   
        exp.querySelector('#exp-household').dataset.id = household.hhid;

    } else {
        exp.querySelector('#exp-household').value = 'None';   
        exp.querySelector('#exp-household').dataset.id = null;
    }

    //Paid by and Payers
    const paidBy = exp.querySelector('#exp-paid-by');
    paidBy.initPickBox();

    const payerBox = exp.querySelector('#exp-payers');
    while(payerBox.firstChild) payerBox.removeChild(payerBox.firstChild);
    
    household.users.forEach(user => {
        paidBy.addPick(user._id, `<p class="dye-active title">${user.name + ' ' + user.surname}</p>`);

        if(user._id === household.self) paidBy.selectPick(user._id);
        
        const payer = document.createElement('div');
        payer.dataset.id = user._id;
        payer.dataset.checked = 'false';
        payer.classList.add('payer');
        payer.innerHTML = `
            <span class="material-icons checkbox">checkbox</span>
            <p class="name">${user.name + ' ' + user.surname}</p>
            <div class="share-wrap percentage-input hidden">
                <input type="number" class="share" max="100" min="0" step="0.1">
            </div>
        `;
        const checkbox = payer.querySelector('.checkbox');
        const shareWrap = payer.querySelector('.share-wrap');
        checkbox.addEventListener('click', () => {
            if(payer.dataset.checked === 'true'){
                payer.dataset.checked = 'false';
                checkbox.classList.remove('active');
                shareWrap.classList.add('hidden');
            } else {
                payer.dataset.checked = 'true';
                checkbox.classList.add('active');
                shareWrap.classList.remove('hidden');
            }
        });

        payerBox.appendChild(payer);
    });

    //Reset amount, category and frequency
    exp.querySelector("#exp-amount").value = null;
    exp.querySelector('#payer-split-division').selectPick('div-equally');
    exp.querySelector('#exp-category').deselectPicks();
    exp.querySelector('#exp-rec-frequency').deselectPicks();

    //Recurring checkbox
    exp.querySelector('#exp-is-recurring').setCheckbox(recurringByDefault);

    //Start date
    exp.querySelector('#exp-rec-start-date').valueAsDate = new Date();

    //Don't show unnecessary elements
    if(!household){
        payerBox.classList.add('hidden');
    } 

    showPage('#expense');
}

function postExpense(){
    try {
        const exp = document.querySelector('#expense');

        const household = exp.querySelector("#exp-household").dataset.id;
        const householdQuery = household ? "?household=" + household : "";
    
        let cid = exp.querySelector("#exp-category").getSelectedPickId();
        let frequency = exp.querySelector("#exp-rec-frequency").getSelectedPickId();
        const amount = exp.querySelector("#exp-amount").value;
        const payers = [];
        if(household) {
            exp.querySelectorAll("#exp-payers .payer[data-checked='true']").forEach(payer => {
                payers.push({
                    "uid": payer.dataset.id,
                    "percentageToPay": payer.querySelector(".share").value
                });
            });
        }
        
        let recurring = null;
        if(exp.querySelector("#exp-is-recurring").getCheckbox()){
            recurring = {
                "startDate": exp.querySelector("#exp-rec-start-date").valueAsDate,
                "endDate": exp.querySelector("#exp-rec-end-date").valueAsDate,
                "frequency": frequency,
                "reminder": exp.querySelector("#exp-send-reminder").getCheckbox()
            };
        }
    
        const json = {
            "cid": cid,
            "amount": amount,
            "payers": payers,
            "recurring": recurring
        };
    
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://45.80.152.150/expense' + householdQuery, true);
        xhr.allowJson();
        xhr.addToken();
        xhr.setStandardTimeout();
        xhr.setError();
        xhr.onload = function() {
            logOffUnauthenticated(xhr);
            if((xhr.status === 200)){
                inform("Expense added successfully", "success");
                showPage(backupPage);
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

function initExpense(categories) {
    
    const exp = document.querySelector('#expense');

    //Recurring expense checkbox functionality
    exp.querySelector('#exp-is-recurring').initCheckbox(
        () => exp.querySelector('#exp-rec-form').classList.remove('hidden'),
        () => exp.querySelector('#exp-rec-form').classList.add('hidden')
    );

    //Send email reminder checkbox functionality
    exp.querySelector('#exp-send-reminder').initCheckbox();

    //Setup split division
    const divisionBox = exp.querySelector('#payer-split-division');
    divisionBox.initPickBox();
    const divisions = [
        { id: 'div-equally', value:'Divide equally' },
        { id: 'div-by-size', value:'Divide by room size' },
        { id: 'div-individually', value:'Divide individually' }];
    divisions.forEach(d => {
        divisionBox.addPick(d.id, `<p class="title dye-active">${d.value}</p>`);
    });

    //Setup categories
    const categoryBox = exp.querySelector('#exp-category');
    categoryBox.initPickBox();

    categories.forEach(c => {
        categoryBox.addPick(c._id, `
            <span class="material-icons dye-active">${c.icon}</span>
            <p>${c.title}</p>
        `);
    })

    //Setup frequencies
    const frequencyBox = exp.querySelector('#exp-rec-frequency');
    frequencyBox.initPickBox();

    const frequencies = [
        { id: 'day', value: 'Day' },
        { id: 'week', value: 'Week' },
        { id: '2-week', value: '2 Weeks' },
        { id: 'month', value: 'Month' },
        { id: '3-month', value: '3 Months' },
        { id: '6-month', value: '6 Months' },
        { id: 'year', value: 'Year' }
    ];
    frequencies.forEach(f => {
        frequencyBox.addPick(f.id, `<p class="dye-active caps-title">${f.value}</p>`);
    });
}