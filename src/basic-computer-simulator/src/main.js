/* ========================================================================== */
/*   main.js                                                                  */
/*   Example programs and application entry point.                            */
/*   Copyright (c) 2010 Laurens Rodriguez.                                    */
/* -------------------------------------------------------------------------- */
/*   This code is licensed under the MIT license:                             */
/*   http://www.opensource.org/licenses/mit-license.php                       */
/* -------------------------------------------------------------------------- */
"use strict";

/* Example programs (ported from Main.mxml) */
const PROGRAMS = [
{
    label: 'Add 2 numbers',
    data:
`//  Program to add two numbers
//  ---------------------------------------------------------------
    ORG 0   // Origin of program is location 0
    LDA A   // Load  operand from location A
    ADD B   // Add  operand from location B
    STA C   // Store sum in location C
    HLT     // Halt computer
A:  DEC 83  // Decimal operand A
B:  DEC -23 // Decimal operand B
C:  HEX 0   // Sum would be stored in this position C
            // 83 + (-23) = 60 = 0x003C = 0000 0000 0011 1100
    END     // End of symbolic program`
},
{
    label: 'Subtract 2 numbers',
    data:
`//  Program to subtract two numbers
//  ---------------------------------------------------------------
        ORG 100 // Origin of program is location 0x100
        LDA SUB // Load subtrahend to AC
        CMA     // Complement AC
        INC     // Increment AC
        ADD MIN // Add minuend to AC
        STA DIF // Store difference in DIF
        HLT     // Halt computer
MIN:    DEC 83  // Minuend
SUB:    DEC -23 // Subtrahend
DIF:    HEX 0   // Difference is stored here
                // 83 - (-23) = 106 = 0x006A = 0000 0000 0110 1010
        END     // End of symbolic program`
},
{
    label: 'Add 16 numbers stored in memory',
    data:
`//  Program to add 16 numbers (using a loop)
//  ---------------------------------------------------------------
        ORG 100     // Origin of program is HEX 100
        LDA DATA    // Load first address of operand
        STA PTR     // Store in pointer
        LDA NUM_S   // Load negative value of number of operands
        STA COUNT   // Store in counter
        CLA         // Clear AC
LOOP:   ADD PTR I   // Add an operand to AC (Indirect mode)
        ISZ PTR     // Increment pointer
        ISZ COUNT   // Increment counter
        BUN LOOP    // Repeat loop again
        STA SUM     // Store sum
        HLT         // Halt computer
SUM:    HEX 0       // Sum is stored here
                    // (0x10 + 0x20 + ... + 0xF0 + 0x100) = 0x880
DATA:   LBL FIRST   // First address of operands
PTR:    HEX 0       // Reserved for a pointer
NUM_S:  DEC -16     // Initial value for the counter (negative value)
COUNT:  HEX 0       // Reserved for a counter
        // DATA SECTION
        // --------------------------------------------------------
FIRST:  HEX 10      // First operand
        HEX 20
        HEX 30
        HEX 40
        HEX 50
        HEX 60
        HEX 70
        HEX 80
        HEX 90
        HEX A0
        HEX B0
        HEX C0
        HEX D0
        HEX E0
        HEX F0
        HEX 100     // Last operand
        END         // End of symbolic program`
}
];

/* Boot */
const computer = new Computer();
