/*
 * MIT License
 *
 * Copyright (c) 2020 Tero Jäntti, Sami H
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/* eslint-disable no-sparse-arrays */
export const endSfx = {
  songData: [
    {
      i: [
        0, 255, 106, 1, 0, 255, 106, 0, 1, 0, 5, 7, 164, 0, 0, 0, 0, 0, 0, 2,
        255, 0, 2, 32, 83, 5, 25, 1,
      ],
      p: [1],
      c: [{ n: [147], f: [] }],
    },
  ],
  rowLen: 5513,
  patternLen: 20,
  endPattern: 0,
  numChannels: 1,
};

export const jumpSfx = {
  songData: [
    {
      i: [
        0, 192, 104, 1, 0, 80, 99, 0, 0, 0, 4, 0, 66, 0, 0, 3, 0, 0, 0, 1, 0, 1,
        2, 32, 0, 12, 60, 8,
      ],
      p: [1],
      c: [
        {
          n: [137],
          f: [
            27,
            28,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            60,
            8,
          ],
        },
      ],
    },
  ],
  rowLen: 5513,
  patternLen: 8,
  endPattern: 0,
  numChannels: 1,
};

export const song = {
  songData: [
    {
      // Instrument 0
      i: [
        0, // OSC1_WAVEFORM
        0, // OSC1_VOL
        140, // OSC1_SEMI
        0, // OSC1_XENV
        0, // OSC2_WAVEFORM
        0, // OSC2_VOL
        140, // OSC2_SEMI
        0, // OSC2_DETUNE
        0, // OSC2_XENV
        255, // NOISE_VOL
        158, // ENV_ATTACK
        158, // ENV_SUSTAIN
        158, // ENV_RELEASE
        0, // ARP_CHORD
        0, // ARP_SPEED
        0, // LFO_WAVEFORM
        51, // LFO_AMT
        2, // LFO_FREQ
        1, // LFO_FX_FREQ
        2, // FX_FILTER
        58, // FX_FREQ
        239, // FX_RESONANCE
        0, // FX_DIST
        32, // FX_DRIVE
        88, // FX_PAN_AMT
        1, // FX_PAN_FREQ
        157, // FX_DELAY_AMT
        2, // FX_DELAY_TIME
      ],
      // Patterns
      p: [1, 2],
      // Columns
      c: [
        { n: [147], f: [] },
        { n: [], f: [] },
      ],
    },
  ],
  rowLen: 5513, // In sample lengths
  patternLen: 32, // Rows per pattern
  endPattern: 1, // End pattern
  numChannels: 1, // Number of channels
};
