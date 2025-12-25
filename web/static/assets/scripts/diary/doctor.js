function patient() {
    fetch(`https://migrenoznik.ru/api/doctor-entries?login=${document.getElementById("migre-login").value}`)
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
                <th>Симптомы</th>
                <th>Препараты</th>
            </tr>`;
            for (const entry of data["entries"]) {
                document.getElementById("migre-table").innerHTML += `<tr>
                    <td>${entry["DT_Start"]}</td>
                    <td>${entry["Duration"]} ч.</td>
                    <td>${entry["Strength"]}/10</td>
                    <td>${entry["Triggers"].join(", ")}</td>
                    <td>${entry["Symptoms"].join(", ")}</td>
                    <td>${entry["Drugs"].join(", ")}</td>
                </tr>`;
            }
        })
        .catch(error => {
            alert('Такого пользователя нет');
        });
}

function address_input() {
    const bracketIndex = document.getElementById("address").value.indexOf('[');
    
    if (bracketIndex != -1) {
        document.getElementById("address").value = document.getElementById("address").value.substring(0, bracketIndex - 1);
        return;
    }
    
    fetch(`https://migrenoznik.ru/api/address?query=${document.getElementById("address").value}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("address-suggestions").innerHTML = "";
            for (const entry of data["values"]) {
                document.getElementById("address-suggestions").innerHTML += `<option value="${entry} [${document.getElementById("address").value}]">`;
            }
        });
}

function med_input() {
    const bracketIndex = document.getElementById("med").value.indexOf('[');
    
    if (bracketIndex != -1) {
        document.getElementById("med").value = document.getElementById("med").value.substring(0, bracketIndex - 1);
        return;
    }
    
    fetch(`https://migrenoznik.ru/api/med?query=${document.getElementById("med").value}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("med-suggestions").innerHTML = "";
            for (const entry of data["values"]) {
                document.getElementById("med-suggestions").innerHTML += `<option value="${entry} [${document.getElementById("med").value}]">`;
            }
        });
}