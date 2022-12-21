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
                <input id="join-by-key" type="text" class="" required>
                <button class="primary">Join</button>
            </div>
        </form>
        <form style="width: 400px" onsubmit="return createHousehold()">
            <div class="spacer-2"></div>
            <h3 class="popup-title">Create new household</h3>
            <div class="page-field w-66">
                <label for="name">Household name</label>
                <input id="new-hh-name" type="text" class="" required>
            </div>
            <div class="page-field">
                <label for="address">Address</label>
                <input id="new-hh-address" type="text" required>
            </div>
            <div class="spacer-small"></div>
            
            <button class="primary">Create</button>
        </form>
        `);
    });
    initChangePage(settingsBtn, getSettings, true);

    //Show overview by default
    overviewBtn.classList.add('active');
    document.querySelector('#overview').classList.add('active');
}

function joinByKey(){
    try {
        const key = document.querySelector("#join-by-key").value;
    
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `http://45.80.152.150/join/household?key=${key}`, true);
        xhr.allowJson();
        xhr.addToken();
        xhr.setStandardTimeout();
        xhr.setError();
        xhr.onload = function() {
            logOffUnauthenticated(xhr);
            if(xhr.status === 200){
                inform("Successfully joined the household!", "success");
                // location.reload();
            } else if (xhr.status === 530) {
                inform(xhr.response, "info");
            } else {
                inform(`Failed to join household (${xhr.response}). Server responded with status code ${xhr.status}`, "failure");
            }
        };
        xhr.send();
    
    } catch(err) {
        console.log(err);
    }
    hidePopup();
    return false;
}

function createHousehold(){
    const name = document.querySelector("#new-hh-name").value;
    const address = document.querySelector("#new-hh-address").value;
    const json = {
        "name": name,
        "address": address,
        'currency': 'DKK'
    };

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://45.80.152.150/household/', true);
    xhr.allowJson();
    xhr.addToken();
    xhr.setStandardTimeout();
    xhr.setError();
    xhr.onload = function() {
        logOffUnauthenticated(xhr);
        if(xhr.status === 200){
            inform("Successfully created the household!", "success");
        } else {
            inform(`Failed to create household (${xhr.response}). Server responded with status code ${xhr.status}`, "failure");
        }
    };
    xhr.send(JSON.stringify(json));

    hidePopup();
    return false;
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

    //Navigation
    const nav = document.querySelector('#navigation');
    const addHousehold = document.querySelector('#add-household-link');

    const pHouseholdElement = document.createElement('p');
    pHouseholdElement.dataset.id = household.hhid;
    pHouseholdElement.innerHTML = '<span class="material-icons icn">home</span> ' + household.name;
    initChangePage(pHouseholdElement, () => { return getHousehold(household.hhid); }, true); //Click functionality

    const ulHouseholdElement = document.createElement('ul');
    if(household.users){
        household.users.forEach(user => {
            if(user._id === household.self) return;
            const liHouseholdElement = document.createElement('li');
            const lastName = ''; //user.surname ? user.surname.charAt(0) : '';
            liHouseholdElement.innerHTML = '<span class="material-icons icn-mini">chevron_right</span>' + user.name + ' ' + lastName;
            liHouseholdElement.dataset.id = user._id;
            ulHouseholdElement.appendChild(liHouseholdElement);
        });
    }

    nav.insertBefore(pHouseholdElement, addHousehold);
    nav.insertBefore(ulHouseholdElement, addHousehold);
}

function getSettings() {
    showPage('#loading-page');

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
        } else {
            inform(`Failed to get settings (${xhr.response})`, "failure");
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

    console.log(res.newsletter);
    document.querySelector('#pi-newsletter').setCheckbox(res.newsletter);

    const hhContainer = document.querySelector('#settings .hh-container');
    while(hhContainer.firstChild) hhContainer.removeChild(hhContainer.firstChild);
    res.households.forEach((hh) => {
        const hhBlock = document.createElement('div');
        hhBlock.innerHTML = `
            <h4 class="hh-name">${hh.name}</h4>
            <p class="hh-id">ID: ${hh.hhid}</p>
            <p class="hh-joined">Joined ${timeAgo(hh.joined)}</p>
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
                hhBlock.popup(`Leave "${hh.name}" household`, `
                    <p>Are you sure you want to leave this household permanently?<br>
                    Any balance will be lost forever.</p>
                    <div class="spacer"></div>    
                    <button class="primary at-the-end" onclick="leaveHousehold('${hh.hhid}', '${window.localStorage.getItem('userId')}')">Leave</button>
                `); 
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
            inform("Successfully left the household!", "success");
            getOverview();
            getSettings();
        }
        else if (xhr.status === 430){
            showError('#error-msg', xhr.response);
        }
        else {
            inform("Failed to leave the household. Server responded with status code " + xhr.status, "failure");
        }
    };
    xhr.send();
    hidePopup();
}

function deleteHousehold(hhid){
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', `http://45.80.152.150/household/${hhid}`, true);
    xhr.allowJson();
    xhr.addToken();
    xhr.setStandardTimeout();
    xhr.setError();
    xhr.onload = function() {
        logOffUnauthenticated(xhr);
        if(xhr.status === 200){
            inform("Successfully deleted the household!", "success");
            getOverview();
            getSettings();
        }
        else {
            inform(`Failed to delete the household (${xhr.response}). Server responded with status code ${xhr.status}`, "failure");
        }
    };
    xhr.send();
    hidePopup();
}

function sendInvite(hhid){
    const emailToInvite = document.querySelector("#hh-invite-email").value;
    try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `http://45.80.152.150/invite/household/${hhid}/user/${emailToInvite}?email=true`, true);
        xhr.allowJson();
        xhr.addToken();
        xhr.setStandardTimeout();
        xhr.setError();
        xhr.onload = function() {
            logOffUnauthenticated(xhr);
            if(xhr.status === 200){
                inform(`${emailToInvite} has been invited to join this household!\nAsk them to check their email to accept the invitation`, "success");
            }
            else {
                inform(xhr.response, "failure");
            }
        };
        xhr.send();
    } catch(err) { }
    hidePopup();
    return false;

}

function getHousehold(hhid){
    showPage('#loading-page');
    backupPage = '#household';

    const hh = document.querySelector('#household');

    try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `http://45.80.152.150/household/${hhid}`, true);
        xhr.allowJson();
        xhr.addToken();
        // xhr.setStandardTimeout();
        xhr.setError();
        xhr.onload = function() {
            logOffUnauthenticated(xhr);
            if(xhr.status === 200){
                const household = JSON.parse(xhr.response);

                // Setup top row buttons
                hh.querySelector('#hh-settle-payments').addEventListener('click', () => {
                    hh.popup(`Settle payments`, `
                        <div style="width: 400px; min-height: 200px">
                            <p style="font-size: 12px">These payments can be made to reset everyone's accounts to zero</p>
                            <div class='payments'>
                                <p class="placeholder">There are no payments to be made</p>
                            </div>
                        </div>
                        <button class="primary at-the-end" style="width: fit-content" onclick="hidePopup()">Close</button>
                    `);

                    const paymentBox = document.querySelector('#popup .payments');
                    if(household.settlingPayments.length > 0) paymentBox.removeChild(paymentBox.querySelector('.placeholder'));

                    household.settlingPayments.forEach(p => {
                        const payment = document.createElement('div');
                        payment.classList.add('payment', 'row', 'gap-10');
                        payment.innerHTML = `
                            <span class="material-icons checkbox">checkbox</span>
                            <p class="p-amount" style="font-weight: bold">${p.amount}</p>
                            <p>from ${p.from.name} to ${p.to.name}</p>
                        `;

                        const checkbox = payment.querySelector('.checkbox');
                        checkbox.initCheckbox();

                        paymentBox.appendChild(payment);
                    });
                });

                hh.querySelector('#hh-invite-user').addEventListener('click', () => {
                    hh.popup(`Invite new user to "${household.name}"`, `
                    <form style="width: 400px" onsubmit="return sendInvite('${household.hhid}')">
                        <label for="Join key">Join key</label>
                        <h2 class="join-key-txt">${household.key}</h2>
                        <p style="font-size: 12px">Send this join key to your roommates so they can join this household too!</p>
                        <div class="spacer"></div>
                    
                        <label for"Email to invite">Email to invite</label>
                        <div class="row gap-10">
                            <input id="hh-invite-email" type="email" class="" required>
                            <button class="primary">Send invite</button>
                        </div>
                    </form>
                    `);
                });

                hh.querySelector('#hh-leave-household').addEventListener('click', () => {
                    hh.popup(`Leave "${household.name}" household`, `
                    <p>Are you sure you want to leave this household permanently?<br>
                    Any balance will be lost forever.</p>
                    <div class="spacer"></div>    
                    <button class="primary at-the-end" onclick="leaveHousehold('${household.hhid}', '${window.localStorage.getItem('userId')}')">Leave</button>
                    `);
                });

                if(household.isAdmin){
                    hh.querySelector('#hh-delete-household').addEventListener('click', () => {
                        hh.popup(`Delete "${household.name}" household`, `
                        <p>Are you sure you want to delete this household permanently?<br>
                        Any data and user balances will be lost forever!</p>
                        <div class="spacer"></div>    
                        <button class="primary at-the-end" onclick="deleteHousehold('${household.hhid}')">
                            <span class="material-icons icn-18">delete_forever</span>
                            Delete
                        </button>
                        `);
                    });
                } else {
                    hh.querySelector('#hh-delete-household').classList.add('hidden');
                }

                // Setup interface
                hh.querySelector('.new-exp-rec').addEventListener('click', () => fillNewExpense(household, true));
                hh.querySelector('.new-exp').addEventListener('click', () => fillNewExpense(household, false));
                hh.querySelector('.page-title').innerText = household.name;
                hh.querySelector('.page-title-2').innerText = household.address;

                // Load users
                const userBox = document.querySelector('#hh-users');
                while(userBox.firstChild) userBox.removeChild(userBox.firstChild);
                household.users.forEach(u => {
                    const uElement = document.createElement('li');
                    uElement.dataset.id = u.uid;
                    uElement.classList.add('user');
                    uElement.innerHTML = `
                        <div class="row gap-10">
                            <span class="material-icons face">face</span>
                            <p class="full-name">${u.name} ${u.surname}</p>
                        </div>
                        <p class="expense-count justify-end">${u.expenses} Expenses</p>
                        <div class="row gap-10 justify-end">
                            <p class="balance">${u.balance} ${household.currency}</p>
                            <span class="material-icons icn dots">more_vert</span>
                        </div>
                    `;
                    userBox.appendChild(uElement);
                });
                

                // Load recurring expenses
                const recurringBox = document.querySelector('#hh-recurring');
                while(recurringBox.firstChild) recurringBox.removeChild(recurringBox.firstChild);

                if(household.recurringExpenses.length === 0){
                    // Placeholder
                    const placeholder = document.createElement('li');
                    placeholder.classList.add('placeholder', 'expense');
                    placeholder.innerHTML = `<p>There are currently no recurring expenses in this household</p>`;

                    recurringBox.appendChild(placeholder);
                } else {
                    household.recurringExpenses.forEach(e => {
                        const eElement = document.createElement('li');
                        eElement.dataset.id = e.eid;
                        eElement.classList.add('expense');
                        eElement.innerHTML = `
                            <div class="row gap-10">
                                <span class="material-icons expense-icon">${e.icon}</span>
                                <p class="title">${e.name}</p>
                            </div>
                            <p class="payer">${e.paidBy}</p>
                            <p class="payers">${e.payers} people</p>
                            <div class="row gap-10">
                                <p class="amount">${e.amount} ${household.currency}</p>
                                <span class="material-icons icn dots">more_vert</span>
                            </div>
                        `;
                        recurringBox.appendChild(eElement);
                    });
                }

                // Load regular expenses
                const expenseBox = document.querySelector('#hh-expenses');
                while(expenseBox.firstChild) expenseBox.removeChild(expenseBox.firstChild);

                if(household.expenses.length === 0){
                    // Placeholder
                    const placeholder = document.createElement('li');
                    placeholder.classList.add('placeholder', 'expense');
                    placeholder.innerHTML = `<p>There are currently no expenses in this household</p>`;

                    expenseBox.appendChild(placeholder);
                } else {
                    household.expenses.forEach(e => {
                        const eElement = document.createElement('li');
                        eElement.dataset.id = e.eid;
                        eElement.classList.add('expense');
                        eElement.innerHTML = `
                            <div class="row gap-10">
                                <span class="material-icons expense-icon">${e.icon}</span>
                                <p class="title">${e.name}</p>
                            </div>
                            <p class="payer">${e.paidBy}</p>
                            <p class="payers">${e.payers} people</p>
                            <p>${timeAgo(e.date)}</p>
                            <div class="row gap-10">
                                <p class="amount">${e.amount} ${household.currency}</p>
                                <span class="material-icons icn dots">more_vert</span>
                            </div>
                        `;
                        expenseBox.appendChild(eElement);
                    });
                }

                showPage('#household');
            }
            else {
                inform(xhr.response, "failure");
            }
        };
        xhr.send();
    } catch(err) {
        inform("Failed to load household. Unknown error occured", "failure");
    }

    
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
        payer.dataset.id = user.uid;
        payer.dataset.checked = 'false';
        payer.classList.add('payer');
        payer.innerHTML = `
            <span class="material-icons checkbox">checkbox</span>
            <p class="name">${user.name + ' ' + user.surname}</p>
            <div class="share-wrap percentage-input hidden">
                <input type="number" class="share" max="100" min="0" step="0.01">
            </div>
        `;
        const checkbox = payer.querySelector('.checkbox');
        const shareWrap = payer.querySelector('.share-wrap');
        const percentage = payer.querySelector('input');

        checkbox.addEventListener('click', () => {
            if(payer.dataset.checked === 'true'){
                payer.dataset.checked = 'false';
                checkbox.classList.remove('active');
                shareWrap.classList.add('hidden');
                updatePayerSplitPercentages(household, percentage);
            } else {
                payer.dataset.checked = 'true';
                checkbox.classList.add('active');
                shareWrap.classList.remove('hidden');
                updatePayerSplitPercentages(household, percentage);
            }
        });
        
        percentage.addEventListener('input', () => { updatePayerSplitPercentages(household, percentage) });

        payerBox.appendChild(payer);
    });

    //Reset amount, category and frequency
    exp.querySelector("#exp-amount").value = null;
    exp.querySelector("#exp-name").value = null;
    exp.querySelector('#payer-split-division').selectPick('div-equally');
    exp.querySelector('#exp-category').deselectPicks();
    exp.querySelector('#exp-rec-frequency').deselectPicks();

    exp.querySelectorAll('#payer-split-division div').forEach(split => split.addEventListener('click', function() {
        if(this.classList.contains('active')){
            updatePayerSplitPercentages(household);
        }
    }));

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

function updatePayerSplitPercentages(household, callerInput) {
    const splitType =  document.querySelector('#payer-split-division').getSelectedPickId();
    const checkedUsers = document.querySelectorAll(`#exp-payers .payer[data-checked='true'] input`);
    const checkedUserIds = [];
    checkedUsers.forEach(u => checkedUserIds.push(u.parentElement.parentElement.dataset.id));
    const checkedHouseholdUsers = household.users.filter(u => checkedUserIds.includes(u.uid));

    if(callerInput){
        if(callerInput.value > 100){
            callerInput.value = 100;
        }
    }
    
    switch(splitType){
        case 'div-equally':
            checkedUsers.forEach(u => u.value = 100 / checkedUsers.length);
            break;
        case 'div-by-size':
            let totalHouseholdSize = 0;
            checkedHouseholdUsers.forEach(u => totalHouseholdSize += u.roomSize);
            checkedUsers.forEach(u => {
                let userRoomSize = 0;
                household.users.forEach(hhu => {
                    if(hhu.uid == u.parentElement.parentElement.dataset.id){
                        userRoomSize = hhu.roomSize;
                    } 
                });
                u.value = 100 / totalHouseholdSize * userRoomSize;
            });
            break;
        default: //'div-individually'
            const usersWithoutValues = [];
            const usersWithValues = [];
            checkedUsers.forEach(u => {
                if(u.value > 0){ usersWithValues.push(u); }
                else { 
                    if(u !== callerInput) usersWithoutValues.push(u); 
                }
            });

            let totalValueSum = 0;
            usersWithValues.forEach(u => totalValueSum += parseFloat(u.value));

            if(usersWithoutValues.length === 0){
                const usersExceptThis = usersWithValues.filter(u => u !== callerInput);
                if(totalValueSum > 100){
                    let totalToSubtract = totalValueSum - 100;
                    usersExceptThis.forEach(o => {
                        if(parseFloat(o.value) < parseFloat(totalToSubtract/usersExceptThis.length)){
                            totalToSubtract = parseFloat(parseFloat(totalToSubtract) - parseFloat(o.value));
                            o.value = 0;
                            usersExceptThis.pop(o);
                        }
                    });
                    usersExceptThis.forEach(o => o.value = parseFloat(parseFloat(o.value) - parseFloat(totalToSubtract/usersExceptThis.length)));
                } else if (totalValueSum < 100){
                    const totalToAdd = 100 - totalValueSum;
                    usersExceptThis.forEach(u => u.value = parseFloat(parseFloat(u.value) + parseFloat(totalToAdd/usersExceptThis.length)));
                }
            } else {
                usersWithoutValues.forEach(u => u.value = parseFloat(parseFloat(100 - totalValueSum) / parseFloat(usersWithoutValues.length)));
            }
            break;
    }
}

function postExpense(){
    try {
        const exp = document.querySelector('#expense');

        const household = exp.querySelector("#exp-household").dataset.id;
        const householdQuery = household ? "?household=" + household : "";
    
        let cid = exp.querySelector("#exp-category").getSelectedPickId();
        let frequency = exp.querySelector("#exp-rec-frequency").getSelectedPickId();
        const amount = exp.querySelector("#exp-amount").value;
        const name = exp.querySelector("#exp-name").value;
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
            "name": name,
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
                getHousehold(household);
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

// Returns how long ago specified date and time occured
function timeAgo(dateString){
    try {
        const now = new Date(Date.now());
        const date = new Date(dateString);
        let result = "";

        const nowM = now.getTime();
        const dateM = date.getTime();
        const diff = nowM - dateM;

        if(diff < 0) return "???";
        const year = Math.floor(diff / 31556952000);
        const month = Math.floor(diff / 2592000000);
        const day = Math.floor(diff / 86400000);
        const hour = Math.floor(diff / 3600000);
        const minute = Math.floor(diff / 60000);

        let usedYear = false;
        let usedMonth = false;
        let usedDay = false;
        let usedHour = false;
        let usedMinute = false;

        if(year > 0){
            result += year + " year";
            if(year > 1) result += "s";
            usedYear = true;
        }

        if(!usedYear){
            if(month % 12 > 0) {
                if(usedYear) result += " "
                result += (month % 12) + " month"
                if(month % 12 > 1) result += "s";
                usedMonth = true;
            }
        }

        if(!usedYear && !usedMonth){
            if(day > 0) {
                result += day + " day";
                if(day > 1) result += "s";
                usedDay = true;
            }
        }

        if(!usedYear && !usedMonth && !usedDay){
            if(hour % 24 > 0){
                result += (hour % 24) + " hour";
                if(hour % 24 > 1) result += "s";
                usedHour = true;
            }
        }

        if(!usedYear && !usedMonth && !usedDay && !usedHour){
            if(minute % 60 > 0){
                if(usedHour) result += " ";
                result += (minute % 60) + " min";
                // if(minute % 60 > 1) result += "s";
                usedMinute = true;
            }
        }

        if(!usedYear && !usedMonth && !usedDay && !usedHour && !usedMinute){
            result += "less than a minute";
        }

        return result + " ago";
    } catch(err) {
        console.log(err);
        return "?";
    }
}

function limitDecimalPlaces(e, count) {
    if (e.target.value.indexOf('.') == -1) { return; }
    if ((e.target.value.length - e.target.value.indexOf('.')) > count) {
        e.target.value = parseFloat(e.target.value).toFixed(count);
    }
}