// Cache-Busting System
class CacheBuster {
    constructor() {
        this.enabled = localStorage.getItem('cacheBuster-enabled') !== 'false'; // Default: enabled
        this.stats = {
            enabled: this.enabled,
            files: {},
            timestamp: new Date().toISOString()
        };
        
        this.init();
    }

    init() {
        this.applyBusters();
        // UpdateToggleUI erst nach DOM-Load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.updateToggleUI());
        } else {
            this.updateToggleUI();
        }
    }

    // Timestamp für Cache-Busting generieren
    generateVersion() {
        // Nutze aktuelles Datum + Stunde (für stündliche Updates)
        const now = new Date();
        return [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0'),
            String(now.getHours()).padStart(2, '0')
        ].join('');
    }

    // Cache-Busting-Parameter anwenden
    applyBusters() {
        if (!this.enabled) {
            this.stats.files = {
                'styles.css': { status: 'disabled', version: '(Cache-Busting deaktiviert)' },
                'script.js': { status: 'disabled', version: '(Cache-Busting deaktiviert)' }
            };
            return;
        }

        const version = this.generateVersion();
        
        // CSS File updaten
        const styleLink = document.getElementById('styles-link');
        const originalStyleHref = 'styles.css';
        styleLink.href = `${originalStyleHref}?v=${version}`;
        
        this.stats.files['styles.css'] = {
            original: originalStyleHref,
            url: styleLink.href,
            version: version,
            status: 'active'
        };

        // JS File updaten (wird später geladen)
        const scriptLink = document.getElementById('script-link');
        const originalScriptSrc = 'script.js';
        scriptLink.src = `${originalScriptSrc}?v=${version}`;
        
        this.stats.files['script.js'] = {
            original: originalScriptSrc,
            url: scriptLink.src,
            version: version,
            status: 'active'
        };
    }

    // Toggle Cache-Busting
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('cacheBuster-enabled', this.enabled);
        
        // Seite neu laden mit neuer Einstellung
        location.reload();
    }

    // UI Update
    updateToggleUI() {
        const toggle = document.getElementById('cache-toggle');
        if (toggle) {
            toggle.textContent = this.enabled ? 
                '✓ Cache-Busting (aktiv)' : 
                '✗ Cache-Busting (inaktiv)';
            toggle.style.color = this.enabled ? 'var(--safe)' : '#d00000';
        }
    }

    // Statistiken anzeigen
    getStats() {
        return {
            enabled: this.enabled,
            version: this.generateVersion(),
            timestamp: new Date().toLocaleString('de-AT'),
            files: this.stats.files
        };
    }
}

// Globale Instanz
let cacheBuster;

// Sicherstellen dass CacheBuster initialisiert wird
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        cacheBuster = new CacheBuster();
    });
} else {
    cacheBuster = new CacheBuster();
}

// Globale Funktionen für HTML-Events - müssen SOFORT verfügbar sein
window.toggleCacheBusting = function() {
    if (!cacheBuster) {
        cacheBuster = new CacheBuster();
    }
    cacheBuster.toggle();
};

window.showCacheStats = function() {
    if (!cacheBuster) {
        cacheBuster = new CacheBuster();
    }
    const modal = document.getElementById('cache-modal');
    const statsBody = document.getElementById('stats-body');
    const stats = cacheBuster.getStats();

    let html = `
        <div class="stats-toggle">
            <label>Cache-Busting:</label>
            <div class="toggle-switch ${stats.enabled ? 'active' : ''}" onclick="toggleCacheBusting()">
                <div class="toggle-slider"></div>
            </div>
        </div>

        <div class="stats-item">
            <strong>Status:</strong> ${stats.enabled ? '✓ Aktiv' : '✗ Inaktiv'}
        </div>

        <div class="stats-item">
            <strong>Aktuelle Version:</strong> ${stats.version}
        </div>

        <div class="stats-item">
            <strong>Zeitstempel:</strong> ${stats.timestamp}
        </div>

        <div class="stats-files">
            <strong style="color: var(--accent);">Betroffene Dateien:</strong>
    `;

    for (const [file, info] of Object.entries(stats.files)) {
        if (info.status === 'disabled') {
            html += `
                <div class="file-row">
                    <strong>${file}</strong><br>
                    <span style="color: #d00000;">Status: ${info.status}</span><br>
                    ${info.version}
                </div>
            `;
        } else {
            html += `
                <div class="file-row">
                    <strong>${file}</strong><br>
                    <span style="color: var(--safe);">Status: ${info.status}</span><br>
                    Original: <code style="color: #888;">${info.original}</code><br>
                    Mit Cache-Buster: <code style="color: var(--accent);">${info.url}</code>
                </div>
            `;
        }
    }

    html += `
        </div>

        <div style="margin-top: 20px; padding: 10px; background: #252525; border-radius: 6px; font-size: 0.85em; color: #aaa;">
            <strong>ℹ️ Wie funktioniert Cache-Busting?</strong><br>
            Ein Query-Parameter mit der aktuellen Stunde wird an die CSS/JS-URLs angehängt. 
            Damit wird sichergestellt, dass Browser die neueste Version der Dateien laden, 
            anstatt veraltete Versionen aus dem Cache zu verwenden. 
            Der Parameter ändert sich stündlich automatisch.
        </div>
    `;

    statsBody.innerHTML = html;
    modal.style.display = 'flex';
};

window.closeCacheStats = function() {
    const modal = document.getElementById('cache-modal');
    modal.style.display = 'none';
};

// Modal bei Click außerhalb schließen
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('cache-modal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});
