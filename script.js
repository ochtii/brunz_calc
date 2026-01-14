// State
let drinks = [];
const updateInterval = 10000; // Alle 10 sekunden update
let currentTimeMode = 'clock'; // 'clock' oder 'timer'

// Debug-Konsole State
let consoleLogs = [];
let consoleVisible = false;
let consoleLocked = true;
let consoleHeight = 300;
let isResizing = false;

// Console intercept
const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error
};

// Override console methods
console.log = function(...args) {
    originalConsole.log.apply(console, args);
    addConsoleEntry('log', args, getCallerInfo());
};

console.info = function(...args) {
    originalConsole.info.apply(console, args);
    addConsoleEntry('info', args, getCallerInfo());
};

console.warn = function(...args) {
    originalConsole.warn.apply(console, args);
    addConsoleEntry('warn', args, getCallerInfo());
};

console.error = function(...args) {
    originalConsole.error.apply(console, args);
    addConsoleEntry('error', args, getCallerInfo());
};

// Fehler abfangen
window.addEventListener('error', (event) => {
    addConsoleEntry('error', [`${event.message}`], `${event.filename}:${event.lineno}:${event.colno}`);
});

function getCallerInfo() {
    const stack = new Error().stack;
    const lines = stack.split('\n');
    // Versuche die aufrufende Zeile zu finden (nicht die console.log Zeile selbst)
    for (let i = 3; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('script.js')) {
            const match = line.match(/script\.js:(\d+):(\d+)/);
            if (match) {
                return `script.js:${match[1]}`;
            }
        }
    }
    return 'unknown';
}

function addConsoleEntry(type, args, location) {
    const timestamp = new Date();
    const message = args.map(arg => {
        if (typeof arg === 'object') {
            try {
                return JSON.stringify(arg, null, 2);
            } catch (e) {
                return String(arg);
            }
        }
        return String(arg);
    }).join(' ');
    
    consoleLogs.push({ type, message, timestamp, location });
    updateConsoleDisplay();
}

function toggleDebugConsole() {
    consoleVisible = !consoleVisible;
    const consoleEl = document.getElementById('debug-console');
    const toggleBtn = document.getElementById('console-toggle');
    
    if (consoleVisible) {
        consoleEl.style.display = 'flex';
        consoleEl.style.height = consoleHeight + 'px';
        toggleBtn.textContent = '🛠️ Konsole schließen';
        updateConsolePosition();
        adjustPageMargin(true);
    } else {
        consoleEl.style.display = 'none';
        toggleBtn.textContent = '🛠️ Debug-Konsole';
        adjustPageMargin(false);
    }
}

function adjustPageMargin(consoleOpen) {
    const container = document.querySelector('.container');
    const position = document.getElementById('console-position').value;
    
    if (consoleOpen) {
        if (position === 'bottom') {
            container.style.marginBottom = (consoleHeight + 20) + 'px';
        } else {
            container.style.marginTop = (consoleHeight + 20) + 'px';
        }
    } else {
        container.style.marginBottom = '0';
        container.style.marginTop = '0';
    }
}

function toggleConsoleSettings() {
    const settings = document.getElementById('console-settings');
    settings.style.display = settings.style.display === 'none' ? 'flex' : 'none';
}

function toggleConsoleLock() {
    consoleLocked = !consoleLocked;
    const lockBtn = document.getElementById('console-lock-btn');
    const resizeHandle = document.getElementById('console-resize-handle');
    
    if (consoleLocked) {
        lockBtn.textContent = '🔒';
        lockBtn.title = 'Größe entsperren';
        resizeHandle.style.display = 'none';
    } else {
        lockBtn.textContent = '🔓';
        lockBtn.title = 'Größe sperren';
        resizeHandle.style.display = 'block';
    }
}

function clearConsole() {
    consoleLogs = [];
    updateConsoleDisplay();
}

function updateConsoleFilters() {
    updateConsoleDisplay();
}

function updateConsolePosition() {
    const consoleEl = document.getElementById('debug-console');
    const position = document.getElementById('console-position').value;
    
    consoleEl.className = 'debug-console position-' + position;
    adjustPageMargin(consoleVisible);
}

function updateConsoleDisplay() {
    const output = document.getElementById('console-output');
    const showLog = document.getElementById('show-log').checked;
    const showInfo = document.getElementById('show-info').checked;
    const showWarn = document.getElementById('show-warn').checked;
    const showError = document.getElementById('show-error').checked;
    const showTimestamp = document.getElementById('show-timestamp').checked;
    
    const filtered = consoleLogs.filter(entry => {
        if (entry.type === 'log' && !showLog) return false;
        if (entry.type === 'info' && !showInfo) return false;
        if (entry.type === 'warn' && !showWarn) return false;
        if (entry.type === 'error' && !showError) return false;
        return true;
    });
    
    document.getElementById('console-count').textContent = `(${filtered.length}/${consoleLogs.length})`;
    
    output.innerHTML = filtered.map((entry, index) => {
        const time = showTimestamp ? `<span class="console-timestamp">${entry.timestamp.toLocaleTimeString('de-AT')}</span>` : '';
        const location = entry.location ? `<div class="console-location">${entry.location}</div>` : '';
        
        return `
            <div class="console-entry ${entry.type}">
                <div class="console-entry-content">
                    ${time}${entry.message}
                    ${location}
                </div>
                <button class="console-copy-btn" onclick="copyConsoleEntry(${index})" title="Kopieren">📋</button>
            </div>
        `;
    }).join('');
    
    output.scrollTop = output.scrollHeight;
}

function copyConsoleEntry(index) {
    const filtered = consoleLogs.filter(entry => {
        const showLog = document.getElementById('show-log').checked;
        const showInfo = document.getElementById('show-info').checked;
        const showWarn = document.getElementById('show-warn').checked;
        const showError = document.getElementById('show-error').checked;
        
        if (entry.type === 'log' && !showLog) return false;
        if (entry.type === 'info' && !showInfo) return false;
        if (entry.type === 'warn' && !showWarn) return false;
        if (entry.type === 'error' && !showError) return false;
        return true;
    });
    
    const entry = filtered[index];
    const text = `[${entry.type.toUpperCase()}] ${entry.timestamp.toLocaleString('de-AT')} - ${entry.message}\nLocation: ${entry.location}`;
    
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓';
        setTimeout(() => btn.textContent = originalText, 1000);
    });
}

function startConsoleResize(e) {
    if (consoleLocked) return;
    isResizing = true;
    
    const startY = e.clientY;
    const startHeight = consoleHeight;
    const position = document.getElementById('console-position').value;
    
    function doResize(e) {
        if (!isResizing) return;
        
        let newHeight;
        if (position === 'bottom') {
            newHeight = startHeight + (startY - e.clientY);
        } else {
            newHeight = startHeight + (e.clientY - startY);
        }
        
        newHeight = Math.max(100, Math.min(600, newHeight));
        consoleHeight = newHeight;
        
        const consoleEl = document.getElementById('debug-console');
        consoleEl.style.height = newHeight + 'px';
        adjustPageMargin(true);
    }
    
    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('mouseup', stopResize);
    }
    
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
}

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

function adjustTimer(amount) {
    console.log('adjustTimer called with:', amount);
    const timerInput = document.getElementById('timeTimer');
    const currentValue = parseInt(timerInput.value) || 0;
    const newValue = Math.max(0, currentValue + amount);
    timerInput.value = newValue;
    console.log('Timer value changed from', currentValue, 'to', newValue);
    
    updateTimerDisplay();
}

// Globale Funktion für onclick - MUSS außerhalb von allem anderen sein
function showTimerInput() {
    console.log('showTimerInput called');
    const displayContainer = document.getElementById('timerDisplayContainer');
    const inputContainer = document.getElementById('timerInputContainer');
    const manualInput = document.getElementById('timeTimerManual');
    const currentValue = document.getElementById('timeTimer').value;
    
    if (!displayContainer || !inputContainer || !manualInput) {
        console.error('Timer elements not found');
        return;
    }
    
    // Container umschalten
    displayContainer.style.display = 'none';
    inputContainer.style.display = 'block';
    
    // Aktuellen Wert setzen und fokussieren
    manualInput.value = currentValue;
    setTimeout(() => {
        manualInput.focus();
        manualInput.select();
    }, 50);
}

// Globale Funktion für onblur
function hideTimerInput() {
    console.log('hideTimerInput called');
    const displayContainer = document.getElementById('timerDisplayContainer');
    const inputContainer = document.getElementById('timerInputContainer');
    const manualInput = document.getElementById('timeTimerManual');
    const timerInput = document.getElementById('timeTimer');
    
    if (!displayContainer || !inputContainer || !manualInput || !timerInput) {
        console.error('Timer elements not found');
        return;
    }
    
    // Wert übernehmen
    const newValue = Math.max(0, parseInt(manualInput.value) || 0);
    timerInput.value = newValue;
    
    // Container umschalten
    inputContainer.style.display = 'none';
    displayContainer.style.display = 'block';
    
    // Display aktualisieren
    updateTimerDisplay();
};

function resetTimer() {
    console.log('resetTimer called');
    const timerInput = document.getElementById('timeTimer');
    timerInput.value = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const timerInput = document.getElementById('timeTimer');
    const display = document.getElementById('timerDisplay');
    const value = parseInt(timerInput.value) || 0;
    
    console.log('updateTimerDisplay:', value);
    
    if (display) {
        display.textContent = value;
        // Animation triggern
        display.classList.remove('timer-pulse');
        void display.offsetWidth; // Reflow erzwingen
        display.classList.add('timer-pulse');
        setTimeout(() => {
            display.classList.remove('timer-pulse');
        }, 300);
    }
}

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

// Disclaimer Funktionen
function showDisclaimer() {
    console.log('showDisclaimer aufgerufen');
    const modal = document.getElementById('disclaimer-modal');
    if (modal) {
        modal.style.display = 'flex';
        console.log('Modal angezeigt');
    } else {
        console.error('Disclaimer-Modal nicht gefunden!');
    }
}

function hideDisclaimer() {
    console.log('hideDisclaimer aufgerufen');
    const modal = document.getElementById('disclaimer-modal');
    if (modal) {
        modal.style.display = 'none';
        console.log('Modal versteckt');
    } else {
        console.error('Disclaimer-Modal nicht gefunden!');
    }
}

// Loop
setInterval(calculatePee, 5000); // Check alle 5 sek
calculatePee(); // Init
