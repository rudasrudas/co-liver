window.onload = () => {
    //Details
    document.querySelector(".main-logo").addEventListener('click', () => location.href = "/");

    //Browsing logic
    const active = 'active';
    const menuBtns = document.querySelectorAll("#navigation > p");
    const pages = document.querySelectorAll("#system-content > .page");

    Array.from(menuBtns).forEach(e => {
        e.addEventListener('click', f => {
            Array.from(menuBtns).forEach(g => g.classList.remove(active));
            Array.from(pages).forEach(g => g.classList.remove(active));
            e.classList.add(active);
            let activePage = null;
            switch(e.id){
                case 'overview-link': activePage = '#overview'; break;
                case 'household-link': activePage = '#household'; break;
                case 'cohabitants-link': activePage = '#cohabitants'; break;
                case 'settings-link': activePage = '#settings'; break;
                default: break;
            }
            if(activePage) document.querySelector(activePage).classList.add(active);
        })
    });

    menuBtns[0].classList.add(active);
    pages[0].classList.add(active);

    // Enable alerts
    const alerts = document.createElement("div");
    alerts.id = "alerts";
    document.body.appendChild(alerts);
}