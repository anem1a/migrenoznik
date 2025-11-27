function patient() {
    fetch(`https://migrenoznik.ru/api/entries?login=${document.getElementById("migre-login").value}`)
    .then(response => {
        if (!response.ok) {
        throw new Error('Ошибка сети: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        alert(JSON.stringify(data, null, 2));
    })
    .catch(error => {
        alert('Произошла ошибка: ' + error.message);
    });
}