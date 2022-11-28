HTMLElement.prototype.startLoading = function() {
    // Fade the object and make it unclickable
    this.style.opacity = '0.5';
    this.classList.add('unclickable');

    // Add spinning loader and translucent background to child element
    const spinner = document.createElement('img');
    spinner.src = "/img/oliver-circle.png";
    spinner.classList.add('spinner');
    this.parentElement.insertBefore(spinner, this);
    spinner.style.marginBottom = getComputedStyle(this).height.replace('px', '')/2 + 'px';
}

HTMLElement.prototype.stopLoading = function() {
    // Restore the object clickability and opacity
    this.style.opacity = '1';
    this.classList.remove('unclickable');

    //Remove spinner
    this.previousElementSibling.remove();
}