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

import { GameObjectClass } from 'kontra';
import { Level } from './level';

const SPEED = 10;

export class Enemy extends GameObjectClass {
  constructor(private level: Level) {
    super({
      width: 30,
      height: 30,
      dx: SPEED,
    });
  }

  update(): void {
    if (this.dx < 0 && this.x <= 2 * this.width) {
      this.dx *= -1;
    } else if (this.dx > 0 && this.level.width - 2 * this.width <= this.x) {
      this.dx *= -1;
    }

    this.advance();
  }

  draw(): void {
    const context = this.context;
    context.save();

    context.fillStyle = 'red';
    context.fillRect(0, 0, this.width, this.height);

    context.restore();
  }
}
