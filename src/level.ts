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

import { Ladder, Platform } from './elements';
import { Camera } from './camera';
import { Sprite } from 'kontra';
import { Player } from './player';

export class Level {
  public number = 0;

  public left = 0;
  public top = 0;
  public width = 2400;
  public height = 2300;

  public isFinished = false;

  public player: Player = new Player(this);

  private ladders: Array<Sprite> = [];
  private platforms: Array<Platform> = [];

  constructor(number: number) {
    this.number = number;
    if (number >= 1) {
      this.fill();

      this.player.x = 100;
      this.player.y = this.height - this.player.height;
    }
  }

  render(context: CanvasRenderingContext2D, camera: Camera): void {
    this.renderBackground(context);

    for (let i = 0; i < this.platforms.length; i++) {
      this.platforms[i].render();
    }

    for (let i = 0; i < this.ladders.length; i++) {
      const ladder = this.ladders[i];
      ladder.render();
    }

    this.player.render();

    // Draw level borders for debugging
    if (!camera.target) {
      context.save();
      context.strokeStyle = 'red';
      context.lineWidth = 5;
      context.beginPath();
      context.lineTo(0, 0);
      context.lineTo(this.width, 0);
      context.lineTo(this.width, this.height);
      context.lineTo(0, this.height);
      context.closePath();
      context.stroke();
      context.restore();
    }
  }

  renderBackground(context: CanvasRenderingContext2D): void {
    context.save();
    context.fillStyle = 'black';
    context.fillRect(0, 0, this.width, this.height);
    context.restore();
  }

  private fill(): void {
    const roomWidth = 400;
    const roomHeight = 300;

    const roomCountX = this.width / roomWidth;
    const roomCountY = this.height / roomHeight;

    const halfWidth = ((roomCountX - 1) * roomWidth) / 2;

    for (let yi = 1; yi < roomCountY; yi++) {
      const y = this.height - yi * roomHeight;

      const left = new Platform();
      left.width = halfWidth;
      left.x = 0;
      left.y = y;
      this.platforms.push(left);

      const right = new Platform();
      right.width = halfWidth;
      right.x = this.width - halfWidth;
      right.y = y;
      this.platforms.push(right);

      for (let xi = 0; xi < 3; xi++) {
        const ladder = new Ladder();
        ladder.x = xi * roomWidth + 10;
        ladder.y = left.y;
        this.ladders.push(ladder);
      }

      for (let xi = 4; xi < roomCountX; xi++) {
        const ladder = new Ladder();
        ladder.x = xi * roomWidth + 10;
        ladder.y = left.y;
        this.ladders.push(ladder);
      }
    }
  }

  update(camera: Camera): void {
    this.player.customUpdate(this.ladders, this.platforms, camera);
  }

  isFailed(): boolean {
    return this.player && this.player.isDead();
  }
}
