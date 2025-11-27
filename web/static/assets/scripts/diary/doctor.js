function patient() {
    fetch(`https://migrenoznik.ru/api/entries?login=${document.getElementById("migre-login").value}`)
    .then(response => {
        if (!response.ok) {
        throw new Error('Ошибка сети: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        document.getElementById("migre-table").innerHTML = `<tr>
            <th>Дата</th>
            <th>Длительность</th>
            <th>Интенсивность</th>
            <th>Триггеры</th>
        </tr>`;
        for (const entry of data["entries"]) {
            document.getElementById("migre-table").innerHTML += `<tr>
                <td>${entry["DT_Start"]}</td>
                <td>${entry["Duration"]} ч.</td>
                <td>${entry["Strength"]}/10</td>
                <td>${entry["Triggers"].join(", ")}</td>
            </tr>`;
        }
    })
    .catch(error => {
        alert('Произошла ошибка: ' + error.message);
    });
}