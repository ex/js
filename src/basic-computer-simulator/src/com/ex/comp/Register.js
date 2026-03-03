/* ========================================================================== */
/*   Register.js                                                              */
/*   Copyright (c) 2010 Laurens Rodriguez.                                    */
/* -------------------------------------------------------------------------- */
/*   This code is licensed under the MIT license:                             */
/*   http://www.opensource.org/licenses/mit-license.php                       */
/* -------------------------------------------------------------------------- */
"use strict";

class Register {
    constructor(computer, name, bits, color) {
        this.computer = computer;
        this.name     = name;
        this.bits     = bits;
        this.maxData  = (bits === 32) ? 0xFFFFFFFF : ((1 << bits) - 1);
        this.data     = 0;
        this.color    = '#' + color.toString(16).padStart(6, '0');
        this._dataEl  = null;
    }

    get word() { return this.data; }

    createEl(container) {
        const box     = document.createElement('div');
        box.className = 'reg-box';
        box.style.backgroundColor = this.color;

        const nameEl     = document.createElement('span');
        nameEl.className = 'reg-name';
        nameEl.textContent = this.name;

        const dataEl     = document.createElement('span');
        dataEl.className = 'reg-data';
        this._dataEl = dataEl;

        box.appendChild(nameEl);
        box.appendChild(dataEl);
        container.appendChild(box);
        this._updateDisplay();
    }

    /* Faithful port of AS3 updateData():
       for k = bits-1 downto 0: if (k-3)%4 === 0 prepend a space */
    _formatBits() {
        let s = '';
        for (let k = this.bits - 1; k >= 0; k--) {
            const bit = (this.data & (1 << k)) ? '1' : '0';
            s += ((k - 3) % 4 === 0) ? ' ' + bit : bit;
        }
        return s;
    }

    _updateDisplay() {
        if (this._dataEl) this._dataEl.textContent = this._formatBits();
    }

    reset() {
        this.data = 0;
        this._updateDisplay();
    }

    setWord(data) {
        this.data = (data >>> 0) & this.maxData;
        this._updateDisplay();
    }

    increment() {
        if (this.data < this.maxData) {
            this.data++;
        } else {
            this.data = 0;
            this.computer.onError('[' + this.name + ']: overflow');
        }
        this._updateDisplay();
    }

    complement() {
        this.data = (~this.data) & this.maxData;
        this._updateDisplay();
    }

    /* Returns old LSB; brings E (carry) in from the top */
    rightShift(carry) {
        const rBit = this.data & 1;
        this.data = ((this.data >>> 1) | ((carry & 1) << (this.bits - 1))) & this.maxData;
        this._updateDisplay();
        return rBit;
    }

    /* Returns old MSB; brings E (carry) in from the bottom */
    leftShift(carry) {
        const lBit = (this.data >>> (this.bits - 1)) & 1;
        this.data  = ((this.data << 1) | (carry & 1)) & this.maxData;
        this._updateDisplay();
        return lBit;
    }
}
