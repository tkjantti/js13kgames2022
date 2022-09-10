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

import { GameObject } from 'kontra';
import { Level } from './level';
import { random } from './utils';

export class Camera {
  public x = 0;
  public y = 0;
  public zoom = 1;

  private shakePower = 0;
  private shakeDecay = 0;

  public target: GameObject | null = null;

  constructor(private level: Level, private canvas: HTMLCanvasElement) {}

  follow(target: GameObject): void {
    this.zoom = 1;
    this.target = target;
  }

  zoomToLevel(): void {
    this.target = null;

    this.x = this.level.left + this.level.width / 2;
    this.y = this.level.top + this.level.height / 2;

    if (
      this.level.width / this.level.height >=
      this.canvas.width / this.canvas.height
    ) {
      this.zoom = this.canvas.width / this.level.width;
    } else {
      this.zoom = this.canvas.height / this.level.height;
    }
  }

  shake(power = 8, length = 0.5): void {
    this.shakePower = power;
    this.shakeDecay = power / length;
  }

  update(): void {
    if (this.target) {
      this.fitZoom();
      this.followFrame(this.target);
    }

    this.shakeFrame();
  }

  private shakeFrame(): void {
    const { shakePower } = this;

    if (shakePower <= 0) {
      return;
    }

    this.x += random(shakePower * 2) - shakePower;
    this.y += random(shakePower * 2) - shakePower;

    this.shakePower -= this.shakeDecay * (1.0 / 60);
  }

  private fitZoom(): void {
    const zoomedWidth = this.level.width * this.zoom;
    const zoomedHeight = this.level.height * this.zoom;

    // Zoom such that camera stays within the this.level.
    if (zoomedWidth < this.canvas.width || zoomedHeight < this.canvas.height) {
      this.zoom = Math.max(
        this.canvas.width / this.level.width,
        this.canvas.height / this.level.height,
      );
    }
  }

  private followFrame(o: GameObject): void {
    let x = o.x + o.width;
    let y = o.y + o.height;

    const viewAreaWidth = this.canvas.width / this.zoom;
    const viewAreaHeight = this.canvas.height / this.zoom;

    // Keep camera within level in x-direction.
    if (x - viewAreaWidth / 2 < this.level.left) {
      x = this.level.left + viewAreaWidth / 2;
    } else if (x + viewAreaWidth / 2 > this.level.width) {
      x = this.level.width - viewAreaWidth / 2;
    }

    // Keep camera within level in y-direction.
    if (y - viewAreaHeight / 2 < this.level.top) {
      y = this.level.top + viewAreaHeight / 2;
    } else if (y + viewAreaHeight / 2 > this.level.height) {
      y = this.level.height - viewAreaHeight / 2;
    }

    this.x = x;
    this.y = y;
  }
}
