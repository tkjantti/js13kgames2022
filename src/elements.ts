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

import { GameObjectClass, SpriteClass } from 'kontra';

const ladderWidth = 30;
const ladderHeight = 300;

const drawLadder = (): HTMLCanvasElement => {
  const stepGap = 64;
  const stepCount = ladderHeight / stepGap;
  const color = 'rgb(100,60,60)';
  const color2 = 'rgb(80,20,20)';

  const canvas = document.createElement('canvas');
  canvas.width = ladderWidth;
  canvas.height = ladderHeight;

  const cx = canvas.getContext('2d');
  if (cx) {
    cx.save();

    for (let i = 0; i < stepCount; i++) {
      cx.fillStyle = color2;
      cx.fillRect(0, i * stepGap, ladderWidth / 3, stepGap);
      cx.fillRect(20, i * stepGap, ladderWidth / 4, stepGap);

      cx.fillStyle = color;
      cx.fillRect(0, i * stepGap + stepGap / 2, ladderWidth, stepGap / 10);
    }

    cx.restore();
  }

  return canvas;
};

const ladderImage = drawLadder();

export class Ladder extends SpriteClass {
  constructor() {
    super({
      width: ladderWidth,
      height: ladderHeight,
      image: ladderImage,
    });
  }
}

export class Platform extends GameObjectClass {
  constructor() {
    super({
      color: 'green',
      width: 200,
      height: 20,
    });
  }

  draw(): void {
    const cx = this.context;
    cx.save();
    cx.fillStyle = this.color;
    cx.fillRect(0, 0, this.width, this.height);
    cx.fillStyle = '#00A000';
    cx.fillRect(0, 0, this.width, this.height / 4);
    cx.restore();
  }
}
