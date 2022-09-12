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

import { GameObjectClass, keyPressed } from 'kontra';
import { Level } from './level';

const SPEED = 7;

export class Ghost extends GameObjectClass {
  startTime: number;

  constructor(private level: Level) {
    super({
      width: 30,
      height: 90,
    });

    this.startTime = performance.now();
  }

  draw(): void {
    const context = this.context;
    const now = performance.now();

    context.save();

    context.globalAlpha = Math.min((now - this.startTime) / 3000, 1);

    const w = this.width * 1.4;
    const h = this.height;

    context.fillStyle = 'rgba(255, 255, 255, 0.9)';
    context.fillRect(0, h / 2, w, h / 2);

    context.beginPath();
    context.arc(w / 2, h / 2, w / 2, 0, 2 * Math.PI);
    context.fill();

    context.fillStyle = 'rgba(0, 0, 0, 0.9)';
    context.beginPath();
    context.arc(w * 0.3, h / 2, w * 0.16, 0, 2 * Math.PI);
    context.arc(w * 0.7, h / 2, w * 0.16, 0, 2 * Math.PI);
    context.fill();

    context.restore();
  }

  update(): void {
    const { dx, dy } = this.handleControls();

    this.updateHorizontalPosition(dx);
    this.updateVerticalPosition(dy);
  }

  private handleControls(): { dx: number; dy: number } {
    let dx = 0;
    let dy = 0;

    if ((keyPressed('arrowleft') || keyPressed('a')) && this.x > 0) {
      dx = -SPEED;
    } else if (
      (keyPressed('arrowright') || keyPressed('d')) &&
      this.x < this.level.width - this.width
    ) {
      dx = SPEED;
    }

    if (keyPressed('arrowup') || keyPressed('w')) {
      dy -= SPEED;
    } else if (keyPressed('arrowdown') || keyPressed('s')) {
      dy += SPEED;
    }

    return { dx, dy };
  }

  private updateHorizontalPosition(dx: number): void {
    if (this.x + dx > this.level.width - this.width) {
      this.x = this.level.width - this.width;
    } else if (this.x + dx < this.level.x) {
      this.x = this.level.x;
    } else if (dx !== 0) {
      this.x += dx;
    }
  }

  private updateVerticalPosition(dy: number): void {
    if (this.y + dy > this.level.height - this.height) {
      this.y = this.level.height - this.height;
    } else if (this.y + dy < this.level.y) {
      this.y = this.level.y;
    } else {
      this.y += dy;
    }
  }
}
