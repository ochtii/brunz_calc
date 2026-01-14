// State
let drinks = [];
const updateInterval = 10000; // Alle 10 sekunden update

// Realistisches Volumen pro Getränktyp
const drinkVolumes = {
    "1.0": 350,   // Wasser / Kracherl
    "1.4": 500,   // Bier / Seidl / Hülse
    "1.2": 300,   // Kaffee / Energy
    "1.6": 80     // Schnaps / Harter Alk
};

function updateAmountDefault() {
    const drinkType = document.getElementById('drinkType').value;
    const amountInput = document.getElementById('amount');
    amountInput.value = drinkVolumes[drinkType];
}

// Event-Listener beim Laden
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('drinkType').addEventListener('change', updateAmountDefault);
    updateAmountDefault(); // Initial setzen
});

function addDrink() {
    const typeSelect = document.getElementById('drinkType');
    const amountInput = document.getElementById('amount');
    const timeInput = document.getElementById('timeOffset'); // Minuten her

    const factor = parseFloat(typeSelect.value);
    const amount = parseInt(amountInput.value);
    const minsAgo = parseInt(timeInput.value);

    if (!amount || amount <= 0) {
        alert("Oida, gib a Menge ein!");
        return;
    }

    // Wir speichern den absoluten Timestamp wann getrunken wurde
    const now = new Date();
    const drinkTime = new Date(now.getTime() - (minsAgo * 60000));

    const drink = {
        id: Date.now(),
        name: typeSelect.options[typeSelect.selectedIndex].text,
        factor: factor,
        amount: amount,
        time: drinkTime
    };

    drinks.push(drink);
    renderList();
    calculatePee();
    
    // Reset Inputs
    document.getElementById('timeOffset').value = 0;
}

function removeDrink(id) {
    drinks = drinks.filter(d => d.id !== id);
    renderList();
    calculatePee();
}

function renderList() {
    const list = document.getElementById('drinkList');
    list.innerHTML = '';
    
    // Sortieren: Neueste oben
    const sortedDrinks = [...drinks].sort((a, b) => b.time - a.time);

    sortedDrinks.forEach(d => {
        const timeStr = d.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const item = document.createElement('div');
        item.className = 'drink-item';
        item.innerHTML = `
            <div>
                <strong>${timeStr}</strong>: ${d.amount}ml (${d.name})
            </div>
            <button class="delete-btn" onclick="removeDrink(${d.id})">X</button>
        `;
        list.appendChild(item);
    });
}

function calculatePee() {
    const capacity = parseInt(document.getElementById('bladderCap').value);
    const now = new Date();
    
    let totalUrineInBladder = 0;

    drinks.forEach(d => {
        // Zeitdifferenz in Minuten
        const diffMs = now - d.time;
        const minutesPassed = diffMs / 60000;

        // DER ALGORITHMUS
        // Modell: Nierenverzögerung. 
        // 0-15 Min: Wenig passiert (Magen -> Blut)
        // 15-90 Min: Hauptverarbeitung (Blut -> Niere -> Blase)
        // > 90 Min: Alles durch.
        
        let processedPercentage = 0;

        if (minutesPassed < 15) {
            // Anfluten: 0% bis 10%
            processedPercentage = (minutesPassed / 15) * 0.10; 
        } else if (minutesPassed >= 15 && minutesPassed <= 90) {
            // Hauptphase: Linear von 10% auf 100%
            // (minutesPassed - 15) / 75 mapped 0..1 auf den Restbereich
            processedPercentage = 0.10 + ((minutesPassed - 15) / 75) * 0.90;
        } else {
            processedPercentage = 1.0;
        }

        // Effektive Urinmenge = Menge * Faktor * Fortschritt
        const urineFromThisDrink = d.amount * d.factor * processedPercentage;
        totalUrineInBladder += urineFromThisDrink;
    });

    // UI Updates
    const percentFull = Math.min(100, Math.round((totalUrineInBladder / capacity) * 100));
    const mlDisplay = Math.round(totalUrineInBladder);

    document.getElementById('percentDisplay').innerText = percentFull + "%";
    document.getElementById('mlDisplay').innerText = mlDisplay;

    const bar = document.getElementById('progressBar');
    const text = document.getElementById('statusText');
    
    bar.style.width = percentFull + "%";

    // Farben & Texte (Austrian Style)
    if (percentFull < 40) {
        bar.style.backgroundColor = "var(--safe)";
        text.innerText = "Alles leiwand.";
        text.style.color = "var(--safe)";
    } else if (percentFull < 75) {
        bar.style.backgroundColor = "#ffca3a"; // Gelb
        text.innerText = "Druck auf der Leitung...";
        text.style.color = "#ffca3a";
    } else if (percentFull < 95) {
        bar.style.backgroundColor = "var(--danger)"; // Rot
        text.innerText = "OIDA! Such an Baum!";
        text.style.color = "var(--danger)";
    } else {
        bar.style.backgroundColor = "#800f2f"; // Dunkelrot
        text.innerText = "HOSE NASS / GAME OVER";
        text.style.color = "#ff0000";
    }
}

// Loop
setInterval(calculatePee, 5000); // Check alle 5 sek
calculatePee(); // Init
