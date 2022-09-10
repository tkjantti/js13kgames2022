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
import { random } from './utils';

export class Level {
  public number = 0;

  public left = 0;
  public top = 0;
  public width = 4000;
  public height = 4000;

  public isFinished = false;

  public player: Player | undefined;

  private ladders: Array<Sprite> = [];
  private platforms: Array<Platform> = [];

  render(context: CanvasRenderingContext2D, camera: Camera) {
    this.renderBackground(context);

    for (let i = 0; i < this.platforms.length; i++) {
      this.platforms[i].render();
    }

    for (let i = 0; i < this.ladders.length; i++) {
      const ladder = this.ladders[i];
      ladder.render();
    }

    this.player!.render();

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

  renderBackground(context: CanvasRenderingContext2D) {
    context.save();
    context.fillStyle = 'black';
    context.fillRect(0, 0, this.width, this.height);
    context.restore();
  }

  addLadder(platform: Platform) {
    const ladder = new Ladder();
    ladder.x = platform.x + 20;
    ladder.y = platform.y;
    this.ladders.push(ladder);
  }

  createTower(x: number, floorCount: number) {
    const floorWidth = 800;
    const floorHeight = 300;

    let isHoleOnPreviousLayer = false;

    for (let i = 0; i < floorCount; i++) {
      const floorTop = this.height - (i + 1) * floorHeight;
      const floorLeft = x - floorWidth / 2;
      const floorRight = floorLeft + floorWidth;

      // No two consecutive platforms with holes in them.
      if (isHoleOnPreviousLayer || random() < 0.8) {
        // One solid platform
        const platform = new Platform();
        platform.width = floorWidth;
        platform.x = floorLeft;
        platform.y = floorTop;
        this.platforms.push(platform);

        this.addLadder(platform);

        isHoleOnPreviousLayer = false;
      } else {
        // Two platforms and a hole between them.
        const lessWidth = floorWidth / 3;

        const p1 = new Platform();
        p1.width = lessWidth;
        p1.x = floorLeft;
        p1.y = floorTop;
        this.platforms.push(p1);
        this.addLadder(p1);

        const p2 = new Platform();
        p2.width = lessWidth;
        p2.x = floorRight - lessWidth;
        p2.y = floorTop;
        this.platforms.push(p2);

        isHoleOnPreviousLayer = true;
      }
    }

    return {
      x,
      width: floorWidth,
      height: floorCount * floorHeight,
      top: this.height - floorCount * floorHeight,
      bottom: this.height,
      left: x - floorWidth / 2,
      right: x + floorWidth / 2,
    };
  }

  update(camera: Camera) {
    this.player!.customUpdate(this.ladders, this.platforms, camera);
  }

  isFailed() {
    return this.player && this.player.isDead();
  }
}
