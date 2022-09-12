/*
 * Copyright (c) 2022 Tero J, Sami H
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

export const renderTexts = (
  context: CanvasRenderingContext2D,
  ...texts: Array<string>
): void => {
  const canvas = context.canvas;

  context.fillStyle = 'white';
  context.font = '22px Sans-serif';

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    const textWidth = text.length * 13;
    const x = canvas.width / 2 - textWidth / 2;
    const y = canvas.height * 0.25 + i * 40;
    context.fillText(text, x, y);
  }
};

export const renderScore = (
  context: CanvasRenderingContext2D,
  score: number,
): void => {
  context.fillStyle = 'white';
  context.font = '20px Sans-serif';

  context.fillText('SCORE     ' + score, 60, 35);
};

export const renderLives = (
  context: CanvasRenderingContext2D,
  lives: number,
): void => {
  const canvas = context.canvas;

  context.fillStyle = 'white';
  context.font = '20px Sans-serif';

  context.fillText('LIVES     ' + lives, canvas.width - 200, 35);
};

export const renderBigNumber = (
  context: CanvasRenderingContext2D,
  number: number,
): void => {
  const canvas = context.canvas;

  context.fillStyle = 'white';
  context.font = '50px Sans-serif';

  context.fillText('' + number, canvas.width / 2, (canvas.height * 1) / 3);
};
