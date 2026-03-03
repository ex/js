/* ========================================================================== */
/*                       SIMULATOR FOR BASIC COMPUTER                         */
/* -------------------------------------------------------------------------- */
/*   A simple simulator for the basic computer described in Morris Mano's     */
/*   book: Computer System Architecture (ISBN: 978-0131755635)                */
/*                                                                            */
/*   Copyright (c) 2010 Laurens Rodriguez.                                    */
/*                                                                            */
/*   Permission is hereby granted, free of charge, to any person              */
/*   obtaining a copy of this software and associated documentation           */
/*   files (the "Software"), to deal in the Software without restriction,     */
/*   including without limitation the rights to use, copy, modify, merge,     */
/*   publish, distribute, sublicense, and/or sell copies of the Software,     */
/*   and to permit persons to whom the Software is furnished to do so,        */
/*   subject to the following conditions:                                     */
/*                                                                            */
/*   The above copyright notice and this permission notice shall be included  */
/*   in all copies or substantial portions of the Software.                   */
/*                                                                            */
/*   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.          */
/* -------------------------------------------------------------------------- */
"use strict";

/* Faithful port of Computer.as
   Depends on: Register, Memory, Assembler (loaded before this script) */
class Computer {
    constructor() {
        // 16-bit main registers
        this.AR   = new Register(this, 'AR',   12, 0xaaee88);
        this.PC   = new Register(this, 'PC',   12, 0xbbff88);
        this.DR   = new Register(this, 'DR',   16, 0xddffaa);
        this.AC   = new Register(this, 'AC',   16, 0xeeff88);
        this.IR   = new Register(this, 'IR',   16, 0xeeeeaa);
        this.TR   = new Register(this, 'TR',   16, 0xeeddbb);
        this.INPR = new Register(this, 'INPR',  8, 0xffccaa);
        this.OUTR = new Register(this, 'OUTR',  8, 0xffbbaa);

        // Sequence counter + flip-flops
        this.SC  = new Register(this, 'SC',  3, 0xaaee88);
        this.I   = new Register(this, 'I',   1, 0xbbff88);
        this.S   = new Register(this, 'S',   1, 0xddffaa);
        this.E   = new Register(this, 'E',   1, 0xeeff88);
        this.R   = new Register(this, 'R',   1, 0xeeeeaa);
        this.IEN = new Register(this, 'IEN', 1, 0xeeddbb);
        this.FGI = new Register(this, 'FGI', 1, 0xffccaa);
        this.FGO = new Register(this, 'FGO', 1, 0xffbbaa);

        // 4096-word memory
        this.M = new Memory(this, 16, 4096);

        this.assembler     = new Assembler(this);
        this.D             = 0;
        this.ticks         = 0;
        this.programLoaded = false;

        this._buildUI();
    }

    /* ── UI wiring ─────────────────────────────────────────────────── */
    _buildUI() {
        // Render registers into their containers
        const ffGrp   = document.getElementById('grp-ff');
        const mainGrp = document.getElementById('grp-main');
        [this.SC, this.I, this.S, this.E, this.R, this.IEN, this.FGI, this.FGO]
            .forEach(r => r.createEl(ffGrp));
        [this.AR, this.PC, this.DR, this.AC, this.IR, this.TR, this.INPR, this.OUTR]
            .forEach(r => r.createEl(mainGrp));
        this.M.createEl();

        // Buttons
        document.getElementById('btnAssemble').onclick = () =>
            this.assemble(document.getElementById('txtProgram').value);
        document.getElementById('btnLoad').onclick     = () => this.load();
        document.getElementById('btnRun').onclick      = () => this.run();
        document.getElementById('btnNext').onclick     = () => this.nextInstruction();
        document.getElementById('btnSetInpr').onclick  = () =>
            this.setInpr(document.getElementById('txtInpr').value);
        document.getElementById('btnSetFgo').onclick   = () => this.setFgo();
        document.getElementById('btnSetFgi').onclick   = () => this.setFgi();
        document.getElementById('btnMemory').onclick   = () =>
            this.setMemoryUpperAddress(document.getElementById('txtMemory').value);

        // Example programs dropdown
        const sel = document.getElementById('cmbPrograms');
        PROGRAMS.forEach((p, i) => {
            const opt = document.createElement('option');
            opt.value = i; opt.textContent = p.label;
            sel.appendChild(opt);
        });
        sel.onchange = () => {
            document.getElementById('txtProgram').value = PROGRAMS[+sel.value].data;
        };

        document.getElementById('txtProgram').value = PROGRAMS[0].data;
    }

    /* ── Public API (mirrors original MXML bindings) ───────────────── */
    showMessage(msg)   { document.getElementById('lblMessage').textContent = msg; }
    setDescription(d)  { document.getElementById('txtDescription').value = d; }
    setCycles(n)       { document.getElementById('txtCycles').value = n; }

    onError(msg)       { this.showMessage('[ERROR] ' + msg); }
    onComputerHalted() { this.showMessage('Computer halted'); }

    assemble(program) {
        if (this.assembler.assemble(program)) {
            document.getElementById('txtLabels').value = this.assembler.labels;
            this.showMessage('Program was successfully assembled');
        }
    }

    load() {
        if (this.assembler.codes.length === 0) {
            this.onError('Program must be assembled first. Type a program and press [Assemble]');
            return;
        }
        this.reset();
        this.PC.setWord(this.assembler.initAddress);
        for (let k = 0; k < this.assembler.codes.length; k++)
            this.M.setWord(this.assembler.addresses[k], this.assembler.codes[k]);
        this.M.setUpperAddress(this.assembler.initAddress);
        document.getElementById('txtMemory').value = '0x' + this.assembler.initAddress.toString(16);
        this.programLoaded = true;
        this.showMessage('Program was loaded. Press [RUN] to run the program or [NEXT] to go instruction by instruction');
    }

    run() {
        if (this.assembler.codes.length === 0) {
            this.onError('Program must be assembled first. Type a program and press [Assemble].'); return;
        }
        if (!this.programLoaded) {
            this.onError('Program must be loaded first. Assemble a program and press [Load].'); return;
        }
        let guard = 200000;
        while (this.S.word === 1 && guard-- > 0) this.nextInstruction();
        if (guard <= 0) this.onError('Cycle limit reached – possible infinite loop.');
    }

    reset() {
        this.S.setWord(1);
        this.I.reset(); this.E.reset(); this.R.reset();
        this.IEN.reset(); this.FGI.reset(); this.FGO.reset();
        this.AR.reset(); this.DR.reset(); this.AC.reset();
        this.IR.reset(); this.TR.reset(); this.INPR.reset(); this.OUTR.reset();
        this.M.reset(); this.SC.reset();
        this.ticks = 0;
    }

    setMemoryUpperAddress(dir) {
        // Accept both "0x1FF" (hex) and decimal
        const address = Number(dir);
        if (!isNaN(address) && address >= 0 && address < this.M.words) {
            this.M.setUpperAddress(address);
        } else {
            this.onError('Invalid RAM address: ' + dir);
        }
    }

    setInpr(val) {
        const v = parseInt(val, 10);
        if (!isNaN(v) && v >= 0 && v < 256) { this.INPR.setWord(v); }
        else { this.onError('Invalid value for INPR'); }
    }

    setFgo() { this.FGO.setWord(1); }
    setFgi() { this.FGI.setWord(1); }

    /* ── Clock cycle ───────────────────────────────────────────────── */
    _tick(msg, instr) {
        this.showMessage(msg);
        this.setDescription(instr);
        this.setCycles(++this.ticks);
    }

    nextInstruction() {
        if (this.S.word === 0) return;

        /* ── T0 / T1 / T2  (fetch or interruption) ── */
        switch (this.SC.word) {
            case 0:
                this.SC.increment();
                if (this.R.word === 0) {
                    this.AR.setWord(this.PC.word);
                    this._tick("R'T0: AR <- PC", 'Fetch');
                } else {
                    this.AR.reset();
                    this.TR.setWord(this.PC.word);
                    this._tick('RT0: AR <- 0 ; TR <- PC', 'Interruption');
                }
                return;

            case 1:
                this.SC.increment();
                if (this.R.word === 0) {
                    this.IR.setWord(this.M.getWord(this.AR.word));
                    this.PC.increment();
                    this._tick("R'T1: IR <- M[AR] ; PC <- PC + 1", 'Fetch');
                } else {
                    this.M.setWord(this.AR.word, this.TR.word);
                    this.PC.reset();
                    this._tick('RT1: M[AR] <- TR ; PC <- 0', 'Interruption');
                }
                return;

            case 2:
                this.SC.increment();
                if (this.R.word === 0) {
                    this.D  = 1 << ((this.IR.word & 0x7000) >> 12);
                    this.AR.setWord(this.IR.word & 0x0FFF);
                    this.I.setWord(this.IR.word >>> 15);
                    this._tick("R'T2: D0,...,D7 decode IR[12-14] ; AR <- IR[0-11] ; I <- IR[15]", 'Decode');
                } else {
                    this.PC.increment();
                    this.IEN.reset(); this.R.reset(); this.SC.reset();
                    this._tick('RT2: PC <- PC + 1 ; IEN <- 0 ; R <- 0 ; SC <- 0', 'Interruption');
                }
                return;
        }

        /* ── Interruption check ── */
        if (this.R.word === 0 && this.IEN.word === 1 &&
            (this.FGI.word === 1 || this.FGO.word === 1)) {
            this.R.setWord(1);
            this.showMessage("T0'T1'T2'(IEN)(FGI + FGO): R <- 1");
            this.setDescription('Interruption ON');
            return;
        }

        /* ── D7 = 0 → Memory-Reference Instruction ── */
        if ((this.D & 0x0080) === 0) {

            /* Indirect address cycle at T3 */
            if (this.SC.word === 3) {
                this.SC.increment();
                if (this.I.word !== 0) {
                    this.AR.setWord(this.M.getWord(this.AR.word));
                    this._tick("D7'IT3: AR <- M[AR]", 'Indirect address');
                } else {
                    this._tick("D7'I'T3: NOTHING", 'Direct address');
                }
                return;
            }

            switch (this.D) {
                /* AND */
                case 0x0001:
                    if (this.SC.word === 4) {
                        this.SC.increment();
                        this.DR.setWord(this.M.getWord(this.AR.word));
                        this._tick('D0T4: DR <- M[AR]', 'AND'); return;
                    }
                    if (this.SC.word === 5) {
                        this.AC.setWord(this.AC.word & this.DR.word);
                        this.SC.reset();
                        this._tick('D0T5: AC <- AC & DR ; SC <- 0', 'AND'); return;
                    }
                    break;

                /* ADD */
                case 0x0002:
                    if (this.SC.word === 4) {
                        this.SC.increment();
                        this.DR.setWord(this.M.getWord(this.AR.word));
                        this._tick('D1T4: DR <- M[AR]', 'ADD'); return;
                    }
                    if (this.SC.word === 5) {
                        const sum = this.AC.word + this.DR.word;
                        this.AC.setWord(sum & 0xFFFF);
                        this.E.setWord((sum >>> 16) & 1);
                        this.SC.reset();
                        this._tick('D1T5: AC <- AC + DR ; E <- carry(AC) ; SC <- 0', 'ADD'); return;
                    }
                    break;

                /* LDA */
                case 0x0004:
                    if (this.SC.word === 4) {
                        this.SC.increment();
                        this.DR.setWord(this.M.getWord(this.AR.word));
                        this._tick('D2T4: DR <- M[AR]', 'LDA'); return;
                    }
                    if (this.SC.word === 5) {
                        this.AC.setWord(this.DR.word);
                        this.SC.reset();
                        this._tick('D2T5: AC <- DR ; SC <- 0', 'LDA'); return;
                    }
                    break;

                /* STA */
                case 0x0008:
                    if (this.SC.word === 4) {
                        this.M.setWord(this.AR.word, this.AC.word);
                        this.SC.reset();
                        this._tick('D3T4: M[AR] <- AC ; SC <- 0', 'STA'); return;
                    }
                    break;

                /* BUN */
                case 0x0010:
                    if (this.SC.word === 4) {
                        this.PC.setWord(this.AR.word);
                        this.SC.reset();
                        this._tick('D4T4: PC <- AR ; SC <- 0', 'BUN'); return;
                    }
                    break;

                /* BSA */
                case 0x0020:
                    if (this.SC.word === 4) {
                        this.SC.increment();
                        this.M.setWord(this.AR.word, this.PC.word);
                        this.AR.increment();
                        this._tick('D5T4: M[AR] <- PC ; AR <- AR + 1', 'BSA'); return;
                    }
                    if (this.SC.word === 5) {
                        this.PC.setWord(this.AR.word);
                        this.SC.reset();
                        this._tick('D5T5: PC <- AR ; SC <- 0', 'BSA'); return;
                    }
                    break;

                /* ISZ */
                case 0x0040:
                    if (this.SC.word === 4) {
                        this.SC.increment();
                        this.DR.setWord(this.M.getWord(this.AR.word));
                        this._tick('D6T4: DR <- M[AR]', 'ISZ'); return;
                    }
                    if (this.SC.word === 5) {
                        this.SC.increment();
                        this.DR.increment();
                        this._tick('D6T5: DR <- DR + 1', 'ISZ'); return;
                    }
                    if (this.SC.word === 6) {
                        this.M.setWord(this.AR.word, this.DR.word);
                        if (this.DR.word === 0) this.PC.increment();
                        this.SC.reset();
                        this._tick('D6T6: M[AR] <- DR ; if (DR=0) then (PC<-PC+1) ; SC<-0', 'ISZ'); return;
                    }
                    break;

                default:
                    this.onError('Unrecognized memory instruction: 0x' + this.D.toString(16));
            }
            this.onError('Wrong timing at SC=' + this.SC.word);

        /* ── D7 = 1, T3, I = 0 → Register-Reference Instruction ── */
        } else if (this.SC.word === 3 && this.I.word === 0) {
            this.SC.reset();
            switch (this.IR.word & 0x0FFF) {
                case 0x0800: this.AC.reset();
                    this._tick("D7I'T3B11: AC <- 0 ; SC <- 0", 'CLA'); return;
                case 0x0400: this.E.reset();
                    this._tick("D7I'T3B10: E <- 0 ; SC <- 0", 'CLE'); return;
                case 0x0200: this.AC.complement();
                    this._tick("D7I'T3B9: AC <- complement(AC) ; SC <- 0", 'CMA'); return;
                case 0x0100: this.E.complement();
                    this._tick("D7I'T3B8: E <- complement(E) ; SC <- 0", 'CME'); return;
                case 0x0080: this.E.setWord(this.AC.rightShift(this.E.word));
                    this._tick("D7I'T3B7: AC <- shr(AC) ; AC(15)<-E ; E<-AC(0) ; SC<-0", 'CIR'); return;
                case 0x0040: this.E.setWord(this.AC.leftShift(this.E.word));
                    this._tick("D7I'T3B6: AC <- shl(AC) ; AC(0)<-E ; E<-AC(15) ; SC<-0", 'CIL'); return;
                case 0x0020: this.AC.increment();
                    this._tick("D7I'T3B5: AC <- AC + 1 ; SC <- 0", 'INC'); return;
                case 0x0010:
                    if ((this.AC.word >>> 15) === 0) this.PC.increment();
                    this._tick("D7I'T3B4: if (AC(15)=0) then (PC<-PC+1) ; SC<-0", 'SPA'); return;
                case 0x0008:
                    if ((this.AC.word >>> 15) === 1) this.PC.increment();
                    this._tick("D7I'T3B3: if (AC(15)=1) then (PC<-PC+1) ; SC<-0", 'SNA'); return;
                case 0x0004:
                    if (this.AC.word === 0) this.PC.increment();
                    this._tick("D7I'T3B2: if (AC=0) then (PC<-PC+1) ; SC<-0", 'SZA'); return;
                case 0x0002:
                    if (this.E.word === 0) this.PC.increment();
                    this._tick("D7I'T3B1: if (E=0) then (PC<-PC+1) ; SC<-0", 'SZE'); return;
                case 0x0001:
                    this.S.reset(); this.SC.reset();
                    this._tick("D7I'T3B0: S <- 0 ; SC <- 0", 'HLT');
                    this.onComputerHalted(); return;
                default:
                    this.onError('Unrecognized register instruction: 0x' + (this.IR.word & 0x0FFF).toString(16));
            }

        /* ── D7 = 1, T3, I = 1 → I/O Instruction ── */
        } else if (this.SC.word === 3 && this.I.word === 1) {
            this.SC.reset();
            switch (this.IR.word & 0x0FFF) {
                case 0x0800:
                    this.AC.setWord(this.INPR.word & 0x00FF);
                    this.FGI.reset();
                    this._tick('D7IT3B11: AC(0-7) <- INPR ; FGI <- 0 ; SC <- 0', 'INP'); return;
                case 0x0400:
                    this.OUTR.setWord(this.AC.word & 0x00FF);
                    this.FGO.reset();
                    this._tick('D7IT3B10: OUTR <- AC(0-7) ; FGO <- 0 ; SC <- 0', 'OUT'); return;
                case 0x0200:
                    if (this.FGI.word === 1) this.PC.increment();
                    this._tick('D7IT3B9: if (FGI=1) then (PC<-PC+1) ; SC<-0', 'SKI'); return;
                case 0x0100:
                    if (this.FGO.word === 1) this.PC.increment();
                    this._tick('D7IT3B8: if (FGO=1) then (PC<-PC+1) ; SC<-0', 'SKO'); return;
                case 0x0080:
                    this.IEN.setWord(1);
                    this._tick('D7IT3B7: IEN <- 1 ; SC <- 0', 'ION'); return;
                case 0x0040:
                    this.IEN.reset();
                    this._tick('D7IT3B6: IEN <- 0 ; SC <- 0', 'IOF'); return;
                default:
                    this.onError('Unrecognized I/O instruction: 0x' + (this.IR.word & 0x0FFF).toString(16));
            }
        }
    }
}
