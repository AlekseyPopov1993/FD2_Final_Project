// 'use strict'

(function () {

    const saveOptionsBtn = document.querySelector('#save_options');
    const inputNameLeft = document.querySelector('#name-left');
    const inputNameRight = document.querySelector('#name-right');

    saveOptionsBtn.addEventListener('click', saveOptions);
    function saveOptions() {
        if (inputNameLeft.value.trim() === '') {
            inputNameLeft.value = 'Player1'
        } 
        if (inputNameRight.value.trim() === '') {
            inputNameRight.value = 'Player2'
        }
        const howManyPoints = document.querySelector('input[name="howManyPoints"]:checked');
        let optionsInfo = {
            'nameLeft': inputNameLeft.value,
            'nameRight': inputNameRight.value,
            'pointsToWin': howManyPoints.value,
        }
        sessionStorage.setItem('options', JSON.stringify(optionsInfo));
}

})();
