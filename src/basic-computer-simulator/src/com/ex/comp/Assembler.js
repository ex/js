/* ========================================================================== */
/*   Assembler.js                                                             */
/*   Simple assembler in two passes with minimal error detection.             */
/*   Copyright (c) 2010 Laurens Rodriguez.                                    */
/* -------------------------------------------------------------------------- */
/*   This code is licensed under the MIT license:                             */
/*   http://www.opensource.org/licenses/mit-license.php                       */
/* -------------------------------------------------------------------------- */
"use strict";

/* Faithful two-pass port of Assembler.as */
class Assembler {
    constructor(computer) {
        this.computer = computer;

        this.PSEUDO  = ['DEC', 'HEX', 'ORG', 'LBL'];

        this.MRI     = ['AND', 'ADD', 'LDA', 'STA', 'BUN', 'BSA', 'ISZ'];
        this.MRI_OPC = [0x0000, 0x1000, 0x2000, 0x3000, 0x4000, 0x5000, 0x6000];

        this.RRI     = ['CLA','CLE','CMA','CME','CIR','CIL','INC',
                        'SPA','SNA','SZA','SZE','HLT',
                        'INP','OUT','SKI','SKO','ION','IOF'];
        this.RRI_OPC = [0x7800,0x7400,0x7200,0x7100,0x7080,0x7040,0x7020,
                        0x7010,0x7008,0x7004,0x7002,0x7001,
                        0xF800,0xF400,0xF200,0xF100,0xF080,0xF040];

        this.initAddress = 0;
        this.codes       = [];
        this.addresses   = [];
        this.labels      = '';
    }

    assemble(program) {
        // Normalise line endings (Flash textarea used \r; HTML uses \n)
        let lines = program
            .replace(/\t/g, ' ')
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .split('\n');

        // Strip comments and mark blank lines as null
        for (let k = 0; k < lines.length; k++) {
            let line = lines[k];
            const ci = line.indexOf('/');
            if (ci >= 0) line = line.substring(0, ci);
            lines[k] = line.replace(/\s/g, '').length === 0 ? null : line;
        }

        this.codes     = [];
        this.addresses = [];

        // ── FIRST PASS ───────────────────────────────────────────────────
        const lblNames = [], lblAddrs = [];
        let lineNo = 0, lineAddr = 0, iniLine = 0, endLine = 0;

        this.initAddress = lineAddr = 0;

        // Skip leading blank lines
        while (lineNo < lines.length && lines[lineNo] === null) lineNo++;

        if (lineNo >= lines.length) {
            this.computer.onError('Empty program.'); return false;
        }

        // Optional ORG at the very top
        if (/ORG/i.test(lines[lineNo])) {
            const m = /^[\s]*ORG[\s]+([0-9a-fA-F]+)[\s]*$/.exec(lines[lineNo]);
            if (m) {
                lineAddr = this.initAddress = parseInt(m[1], 16);
                lineNo++;
                iniLine = lineNo;
            } else {
                this.computer.onError('Line(' + (lineNo+1) + ') ORG address is not a valid hex number.');
                return false;
            }
        }

        this.labels = '';
        for (; lineNo < lines.length; lineNo++) {
            if (lines[lineNo] !== null) {
                const m = /^[\s]*([a-zA-Z\d_]+):/.exec(lines[lineNo]);
                if (m) {
                    lblNames.push(m[1]);
                    lblAddrs.push(lineAddr);
                    const pad = ' '.repeat(Math.max(0, 9 - m[1].length));
                    this.labels += m[1] + ':' + pad + lineAddr.toString(16).toUpperCase() + '\n';
                }
                lineAddr++;
                if (/END/i.test(lines[lineNo])) { endLine = lineNo; break; }
            }
        }

        if (endLine === 0) {
            this.computer.onError('END was not found.'); return false;
        }

        // ── SECOND PASS ──────────────────────────────────────────────────
        lineAddr = this.initAddress;

        for (lineNo = iniLine; lineNo < endLine; lineNo++) {
            if (lines[lineNo] === null) continue;

            let line = lines[lineNo];

            // Strip label prefix
            const ci = line.indexOf(':');
            if (ci >= 0) line = line.substring(ci + 1);

            // Trim surrounding whitespace then tokenise
            line = line.trim();
            const tokens = line.split(/\s+/).filter(t => t.length > 0);

            if (tokens.length < 1 || tokens.length > 3) {
                this.computer.onError('Line(' + (lineNo+1) + ') invalid line: ' + lines[lineNo]);
                return false;
            }

            const mnem = tokens[0].toUpperCase();

            // ── Pseudo-instructions ────────────────────────────────────
            let idx = this.PSEUDO.indexOf(mnem);
            if (idx >= 0) {
                if (tokens.length === 2) {
                    let data;
                    switch (idx) {
                        case 0: // DEC – supports negatives
                            data = parseInt(tokens[1], 10);
                            if (!isNaN(data)) { if (data < 0) data = data & 0xFFFF; }
                            break;
                        case 1: // HEX
                            data = parseInt(tokens[1], 16);
                            break;
                        case 2: // ORG (mid-program)
                            lineAddr = parseInt(tokens[1], 16);
                            if (!isNaN(lineAddr)) continue;
                            this.computer.onError('Line(' + (lineNo+1) + ') invalid ORG: ' + lines[lineNo]);
                            return false;
                        case 3: { // LBL – value of a label
                            const li = lblNames.indexOf(tokens[1]);
                            if (li >= 0) { data = lblAddrs[li]; }
                            else {
                                this.computer.onError("Line(" + (lineNo+1) + ") can't find label: " + tokens[1]);
                                return false;
                            }
                            break;
                        }
                    }
                    if (!isNaN(data)) {
                        this.codes.push(data >>> 0);
                        this.addresses.push(lineAddr++);
                        continue;
                    }
                }
                this.computer.onError('Line(' + (lineNo+1) + ') invalid HEX or DEC: ' + lines[lineNo]);
                return false;
            }

            // ── Register-Reference Instructions ───────────────────────
            idx = this.RRI.indexOf(mnem);
            if (idx >= 0) {
                if (tokens.length === 1) {
                    this.codes.push(this.RRI_OPC[idx]);
                    this.addresses.push(lineAddr++);
                    continue;
                }
                this.computer.onError('Line(' + (lineNo+1) + ') invalid RRI: ' + lines[lineNo]);
                return false;
            }

            // ── Memory-Reference Instructions ─────────────────────────
            idx = this.MRI.indexOf(mnem);
            if (idx >= 0) {
                if (tokens.length === 2 || tokens.length === 3) {
                    const li = lblNames.indexOf(tokens[1]);
                    if (li >= 0) {
                        if (tokens.length === 2) {
                            this.codes.push(this.MRI_OPC[idx] | lblAddrs[li]);
                            this.addresses.push(lineAddr++);
                            continue;
                        } else if (tokens[2].toUpperCase() === 'I') {
                            this.codes.push(0x8000 | this.MRI_OPC[idx] | lblAddrs[li]);
                            this.addresses.push(lineAddr++);
                            continue;
                        }
                    } else {
                        this.computer.onError("Line(" + (lineNo+1) + ") can't find label: " + tokens[1]);
                        return false;
                    }
                }
                this.computer.onError('Line(' + (lineNo+1) + ') invalid MRI: ' + lines[lineNo]);
                return false;
            }

            this.computer.onError('Line(' + (lineNo+1) + ') unknown instruction: ' + tokens[0]);
            return false;
        }

        return true;
    }
}
