/**
 * Displays or hides "Migraine Now" block
 * @param {boolean} show true if you need to show it, false if to hide
 */
function display_migraine_now_block(show) {
    if (show) {
        document.getElementById("migre-now-wrapper").style.display = 'block';
    } else {
        document.getElementById("migre-now-wrapper").style.display = 'none';
    }
}

/**
 * Configures main bottom buttons depends on the migraine status.  
 * @param {boolean} migraine_now 
 */
function configure_main_bottom_buttoms(migraine_now) {
    if (migraine_now) {
        document.getElementById("migre-diary-main-bottom-button-now").innerText = "Отметить конец мигрени";
        document.getElementById("migre-diary-main-bottom-button-add").style.display = 'none';
    } else {
        document.getElementById("migre-diary-main-bottom-button-now").innerText = "Отметить мигрень сейчас";
        document.getElementById("migre-diary-main-bottom-button-add").style.display = 'block';
    }
}