# Brunz-Rechner 3000 🚽

**Offizielles Tool der MA Bunker Wien (Abteilung Flüssigkeitsmanagement).** *Für Stefan, Vicky und alle anderen Wappla, die ned wissen, wanns Zeit is.*

## Was is des?
Eine Web-Applikation (Single Page), die berechnet, wann du im Bunker, in der Kinettn oder beim Heurigen aufs Heisl musst. Basierend auf wissenschaftlichen Schätzungen und österreichischen Trinkgewohnheiten.

## Features
* **Tank-Konfigurator:** Ob Konfirmanden-Blase oder Bier-Tank – alles einstellbar.
* **Multi-Drink-Tracking:** Egal ob du 5 Seidl oder 3 Spritzer intus hast, der Rechner addiert den Druck.
* **Echtzeit-Simulation:** Der Füllstand steigt live, während deine Nieren hackln.
* **Bunker-Mode:** Dunkles Design, damit dich im Stollen keiner sieht.

## Der Algorithmus (Die Wissenschaft, Oida)

Der Kern des Ganzen ist die Berechnung des **$U_{eff}$ (Effektives Urinvolumen)** zum Zeitpunkt $t$.

### 1. Der Faktor ($F$)
Nicht alles, was man sauft, kommt 1:1 raus.
* **Wasser:** $F = 1.0$ (Langweilig)
* **Kaffee/Energy:** $F = 1.2$ (Koffein treibt an)
* **Bier:** $F = 1.4$ (Alkohol hemmt ADH $\rightarrow$ Du brunzt mehr als du trinkst)
* **Schnaps:** $F = 1.6$ (Maximale Dehydrierung)

### 2. Die Nieren-Verzögerung ($P(t)$)
Wenn du jetzt ein Seidl trinkst, musst du nicht *sofort* schiffen. Das dauert.
Wir verwenden ein lineares 3-Phasen-Modell für die Verstoffwechselung:

* **Phase 1 (0 - 15 Min):** Magen $\rightarrow$ Blut.
    * Kaum Urinproduktion (0% bis 10%).
* **Phase 2 (15 - 90 Min):** Die Welle.
    * Die Nieren hackln auf Hochtouren. Linearer Anstieg von 10% auf 100%.
* **Phase 3 (> 90 Min):** Alles durch.
    * Das Getränk ist vollständig in der Blase angekommen.

### 3. Die Formel
$$Füllstand \% = \frac{\sum (Menge_i \times Faktor_i \times P(t-t_i))}{Kapazität_{Blase}} \times 100$$

## Installation (GitHub Pages)

Wie du das Ding online bringst, Stefan:

1.  Erstell ein neues Repo auf GitHub (z.B. `brunz-rechner`).
2.  Erstell eine Datei `index.html` und kopier den Code rein.
3.  Geh auf **Settings** -> **Pages**.
4.  Wähl bei "Branch" `main` (oder `master`) und speicher.
5.  Warte 2 Minuten. GitHub gibt dir einen Link (z.B. `https://stefan-ma-bunker.github.io/brunz-rechner/`).
6.  Sauf di an und teste es.

---
*Made with ❤️ and Seidl in Vienna.*
