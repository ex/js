/* ========================================================================== */
/*   Memory.js                                                                */
/*   Copyright (c) 2010 Laurens Rodriguez.                                    */
/* -------------------------------------------------------------------------- */
/*   This code is licensed under the MIT license:                             */
/*   http://www.opensource.org/licenses/mit-license.php                       */
/* -------------------------------------------------------------------------- */
"use strict";

/* Memory  (4096 × 16-bit words, shows 16 rows at a time) */
class Memory {
    constructor(computer, bits, words) {
        this.computer      = computer;
        this.bits          = bits;
        this.words         = words;
        this.wordsOnScreen = 16;
        this.upAddr        = 0;
        this.data          = new Uint16Array(words);
        this._rows         = [];   // [{addr, hex, bin}, ...]
    }

    createEl() {
        const tbody = document.getElementById('mem-tbody');
        for (let i = 0; i < this.wordsOnScreen; i++) {
            const tr  = document.createElement('tr');
            const tdA = document.createElement('td'); tdA.className = 'mem-addr';
            const tdH = document.createElement('td'); tdH.className = 'mem-hex';
            const tdB = document.createElement('td'); tdB.className = 'mem-bin';
            tr.append(tdA, tdH, tdB);
            tbody.appendChild(tr);
            this._rows.push({ addr: tdA, hex: tdH, bin: tdB });
        }
        this.setUpperAddress(0);
    }

    getWord(address) {
        return this.data[address] || 0;
    }

    setWord(address, value) {
        this.data[address] = value & 0xFFFF;
        this._updateRow(address);
    }

    setUpperAddress(address) {
        this.upAddr = address;
        for (let k = 0; k < this.wordsOnScreen; k++) this._updateRow(address + k);
    }

    reset() {
        this.data.fill(0);
        this.upAddr = 0;
        for (let k = 0; k < this.wordsOnScreen; k++) this._updateRow(k);
    }

    _updateRow(address) {
        const idx = address - this.upAddr;
        if (idx < 0 || idx >= this.wordsOnScreen) return;
        const val = this.data[address] || 0;
        const row = this._rows[idx];
        row.addr.textContent = address.toString(16).toUpperCase().padStart(3, '0');
        row.hex.textContent  = val.toString(16).toUpperCase().padStart(4, '0');

        let s = '';
        for (let k = this.bits - 1; k >= 0; k--) {
            const bit = (val & (1 << k)) ? '1' : '0';
            s += ((k - 3) % 4 === 0) ? ' ' + bit : bit;
        }
        row.bin.textContent = s;
    }
}
