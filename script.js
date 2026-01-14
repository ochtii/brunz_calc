// State
let drinks = [];
const updateInterval = 10000; // Alle 10 sekunden update
let currentTimeMode = 'clock'; // 'clock' oder 'timer'

// Realistisches Volumen pro Getränktyp
const drinkVolumes = {
    "1.0": 350,   // Wasser / Kracherl
    "1.4": 500,   // Bier / Seidl / Hülse
    "1.2": 300,   // Kaffee / Energy
    "1.6": 80     // Schnaps / Harter Alk
};

// Slider-Bereiche pro Getränktyp (min, max, default)
const sliderRanges = {
    "1.0": { min: 100, max: 1000, default: 350 },   // Wasser / Kracherl
    "1.4": { min: 200, max: 1000, default: 500 },   // Bier / Seidl / Hülse
    "1.2": { min: 100, max: 500, default: 300 },    // Kaffee / Energy
    "1.6": { min: 20, max: 200, default: 80 }       // Schnaps / Harter Alk
};

function updateAmountDefault() {
    const drinkType = document.getElementById('drinkType').value;
    const amountInput = document.getElementById('amount');
    const range = sliderRanges[drinkType];
    
    // Update Slider-Bereich
    amountInput.min = range.min;
    amountInput.max = range.max;
    amountInput.value = range.default;
    
    // Update Labels
    document.getElementById('sliderMin').textContent = range.min + 'ml';
    document.getElementById('sliderMax').textContent = range.max + 'ml';
    document.getElementById('amountValue').textContent = range.default;
}

window.updateSliderValue = function() {
    const amountInput = document.getElementById('amount');
    document.getElementById('amountValue').textContent = amountInput.value;
};

window.switchTimeMode = function(mode) {
    currentTimeMode = mode;
    
    console.log('Switching to mode:', mode, 'currentTimeMode is now:', currentTimeMode);
    
    // Button-Styling
    const clockBtn = document.getElementById('timeModeClock');
    const timerBtn = document.getElementById('timeModeTimer');
    
    if (clockBtn) clockBtn.classList.toggle('active', mode === 'clock');
    if (timerBtn) timerBtn.classList.toggle('active', mode === 'timer');
    
    // Input-Bereiche umschalten
    const clockInput = document.getElementById('timeInputClock');
    const timerInput = document.getElementById('timeInputTimer');
    
    if (clockInput) clockInput.style.display = mode === 'clock' ? 'block' : 'none';
    if (timerInput) timerInput.style.display = mode === 'timer' ? 'block' : 'none';
};

window.adjustTimer = function(amount) {
    const timerInput = document.getElementById('timeTimer');
    const currentValue = parseInt(timerInput.value) || 0;
    const newValue = Math.max(0, currentValue + amount);
    timerInput.value = newValue;
};

// Event-Listener beim Laden
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('drinkType').addEventListener('change', updateAmountDefault);
    updateAmountDefault(); // Initial setzen
    
    // Aktuelle Uhrzeit setzen
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('timeClock').value = hours + ':' + minutes;
});

window.addDrink = function() {
    const typeSelect = document.getElementById('drinkType');
    const amountInput = document.getElementById('amount');

    const factor = parseFloat(typeSelect.value);
    const amount = parseInt(amountInput.value);

    if (!amount || amount <= 0) {
    console.log('Current time mode:', currentTimeMode);
    
        alert("Oida, gib a Menge ein!");
        return;
    }

    // Zeit basierend auf Modus berechnen
    const now = new Date();
    let drinkTime;
    
    if (currentTimeMode === 'clock') {
        const timeClockValue = document.getElementById('timeClock').value;
        if (!timeClockValue) {
            alert("Oida, gib a Uhrzeit ein!");
            return;
        }
        
        const [hours, minutes] = timeClockValue.split(':').map(Number);
        drinkTime = new Date();
        drinkTime.setHours(hours);
        drinkTime.setMinutes(minutes);
        drinkTime.setSeconds(0);
        
        // Falls Uhrzeit in der Zukunft liegt, nehmen wir gestern an
        if (drinkTime > now) {
            drinkTime.setDate(drinkTime.getDate() - 1);
        }
    } else {
        // Timer-Modus
        const minsAgo = parseInt(document.getElementById('timeTimer').value) || 0;
        drinkTime = new Date(now.getTime() - (minsAgo * 60000));
    }

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
    if (currentTimeMode === 'timer') {
        document.getElementById('timeTimer').value = 0;
    } else {
        // Aktuelle Uhrzeit setzen
        const resetTime = new Date();
        const hours = String(resetTime.getHours()).padStart(2, '0');
        const minutes = String(resetTime.getMinutes()).padStart(2, '0');
        document.getElementById('timeClock').value = hours + ':' + minutes;
    }
}

window.removeDrink = function(id) {
    drinks = drinks.filter(d => d.id !== id);
    renderList();
    calculatePee();
};

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

window.taciticalVomit = function() {
    if (drinks.length === 0) {
        alert("Oida, es gibt nix zum Ausleieren!");
        return;
    }

    // Blase-Animation triggern
    const bladder = document.getElementById('bladderVisual');
    bladder.classList.add('vomit-animation');
    
    // Nach Animation: 50% des Inhalts entfernen
    setTimeout(() => {
        drinks.forEach(d => {
            // Reduziere die "verarbeitete" Menge um 50%
            // Wir machen das, indem wir die Zeit zurücksetzen (als würde die Flüssigkeit nochmal von vorne anfangen)
            const now = new Date();
            d.time = new Date(now.getTime() - (5 * 60000)); // Setze auf 5 min her (mid-processing)
        });
        
        renderList();
        calculatePee();
        
        // Animation entfernen
        bladder.classList.remove('vomit-animation');
        
        // Bestätigungsmeldung
        alert("🤢 Pfffffff! 50% des Inhalts entleert. Viel Erfolg beim nächsten Durchgang!");
    }, 600);
}

// Loop
setInterval(calculatePee, 5000); // Check alle 5 sek
calculatePee(); // Init
