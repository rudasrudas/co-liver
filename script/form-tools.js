// PICKS (Option selection)

//Initialize selection box
HTMLElement.prototype.initPickBox = function(){
    this.classList.add('pick-box');

    while(this.firstChild) this.removeChild(this.firstChild);
}

//Add selection option
HTMLElement.prototype.addPick = function(id, template){
    try {
        if(!this.classList.contains('pick-box')) return false;

        const pick = document.createElement('div');
        pick.switchfunc = () => {
            if(pick.classList.contains('active')){
                pick.classList.remove('active');
                this.querySelectorAll('.pick').forEach(p => p.classList.remove('hidden'));
            } else {
                this.querySelectorAll('.pick').forEach(p => p.classList.remove('active'));
                pick.classList.add('active');
                this.querySelectorAll('.pick:not(.active)').forEach(p => p.classList.add('hidden'));
            }
        }

        pick.dataset.id = id;
        pick.classList.add('pick');
        pick.innerHTML = template;
        pick.addEventListener('click', () => {
            pick.switchfunc();
        });
    
        this.appendChild(pick);
        return true;
    } catch(err) {
        console.log(err);
        return false;
    }
}

//Get selected option element
HTMLElement.prototype.getSelectedPick = function(){
    return this.querySelector(".pick.active");
}

//Get selected option id
HTMLElement.prototype.getSelectedPickId = function(){
    return this.getSelectedPick() ? this.getSelectedPick().dataset.id : null;
}

//Select option by id
HTMLElement.prototype.selectPick = function(id){
    try {
        const pick = this.querySelector(`.pick[data-id='${id}']`);
        if(!pick) return false;

        pick.classList.remove('active');
        pick.switchfunc();
    } catch(err) {
        return false;
    }
}

//Deselect everything
HTMLElement.prototype.deselectPicks = function(){
    this.querySelectorAll(".pick").forEach(p => p.classList.remove('active'));
    this.querySelectorAll(".pick").forEach(p => p.classList.remove('hidden'));
}

// CHECKBOX

//Initialize checkbox
HTMLElement.prototype.initCheckbox = function(activate, deactivate, defaultValue){
    this.classList.add('row', 'checkbox-align');
    const text = this.innerText;
    this.activateFunc = activate;
    this.deactivateFunc = deactivate;
    this.innerHTML = `
        <span class="material-icons checkbox" id="exp-send-reminder">checkbox</span>
        <p class="checkbox-label">${text}</p>
    `;
    this.checkFunc = () => {
        if(this.dataset.checked === 'true'){
            this.dataset.checked = 'false';
            try{
                deactivate();
            } catch(err){ }
        } else {
            this.dataset.checked = 'true';
            try{
                activate();
            } catch(err) { }
        }
    }

    this.addEventListener('click', () => {
        this.classList.toggle('active');
        this.checkFunc();
    });

    this.dataset.checked = defaultValue ? 'true' : 'false';
    this.checkFunc();
}

HTMLElement.prototype.setCheckbox = function(value) {
    if(value){
        this.dataset.checked = 'true';
        this.classList.add('active');
        try{
            this.activateFunc();
        } catch(err) { }
    } else {
        this.dataset.checked = 'false';
        this.classList.remove('active');
        try {
            this.deactivateFunc();
        } catch(err) { }
    }
}

HTMLElement.prototype.getCheckbox = function(){
    return this.dataset.checked === 'true';
}