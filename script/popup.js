function initPopups(){
    const popupWrap = document.createElement('div');
    popupWrap.classList.add('page', 'hidden');
    popupWrap.id = 'popup-wrap';
    popupWrap.innerHTML = `
        <div id="popup">
            <h3 class="popup-title"></h3>
            <span class="material-icons x-btn">close</span>
            <div class="popup-content"></div>
        </div>
    `;

    const popupClose = popupWrap.querySelector('.x-btn');
    popupClose.addEventListener('click', () => {
        popupWrap.classList.add('hidden');
    });

    popupWrap.addEventListener('click', (event) => {
        if (popupWrap !== event.target) return;
        popupWrap.classList.add('hidden');
    }, false)

    document.body.appendChild(popupWrap);
}

function hidePopup(){
    const popupWrap = document.querySelector('#popup-wrap');
    const popupTitle = popupWrap.querySelector('.popup-title');
    const popupContent = popupWrap.querySelector('.popup-content');

    popupWrap.classList.add('hidden');
    popupTitle.innerHTML = '';
    popupContent.innerHTML = '';
}

HTMLElement.prototype.popup = function(title, content) {
    const popupWrap = document.querySelector('#popup-wrap');
    const popupTitle = popupWrap.querySelector('.popup-title');
    const popupContent = popupWrap.querySelector('.popup-content');

    popupTitle.innerHTML = title;
    popupContent.innerHTML = content;

    document.querySelector('#system-content').appendChild(popupWrap);
    popupWrap.classList.remove('hidden');
}