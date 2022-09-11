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

import { GameObjectClass, Vector } from 'kontra';
import { Level } from './level';
import { getDistance } from './utils';

const SPEED = 10;

type State =
  | { type: 'patrol' }
  | { type: 'alarm'; start: number }
  | { type: 'goto'; target: Vector };

function getFlashingColor(now: number): string {
  return Math.floor(now / 500) % 2 === 0 ? 'red' : 'white';
}

export class Enemy extends GameObjectClass {
  private state: State = { type: 'patrol' };

  alarmed: (target: Vector) => void = () => {};

  constructor(private level: Level) {
    super({
      width: 30,
      height: 30,
      dx: SPEED,
    });
  }

  goTo(point: Vector): void {
    this.state = { type: 'goto', target: point };
  }

  update(): void {
    const now = performance.now();

    switch (this.state.type) {
      case 'alarm':
        if (now - this.state.start > 2000) {
          this.state = { type: 'patrol' };
        }
        break;
      case 'patrol':
        this.patrol();
        const player = this.level.player;
        if (getDistance(this.position, player.position) < 200) {
          this.state = { type: 'alarm', start: now };
          this.dx = 0;
          this.dy = 0;
          this.alarmed(player.position);
        }
        break;
      case 'goto':
        const target = this.state.target;
        if (this.position.distance(target) > 200) {
          this.moveTowards(target);
        } else {
          this.state = { type: 'patrol' };
          this.dx = 0;
          this.dy = 0;
        }
        break;
    }

    this.advance();
  }

  draw(): void {
    const now = performance.now();
    const context = this.context;
    context.save();

    switch (this.state.type) {
      case 'patrol':
        context.fillStyle = 'white';
        break;
      case 'alarm':
        context.fillStyle = getFlashingColor(now);
        break;
    }

    context.fillRect(0, 0, this.width, this.height);

    context.restore();
  }

  private patrol(): void {
    if (this.dx === 0) {
      this.dx = SPEED;
    } else if (this.dx < 0 && this.x <= 2 * this.width) {
      this.dx *= -1;
    } else if (this.dx > 0 && this.level.width - 2 * this.width <= this.x) {
      this.dx *= -1;
    }
  }

  private moveTowards(target: Vector): void {
    const direction = target.subtract(this.position).normalize().scale(SPEED);
    this.dx = direction.x;
    this.dy = direction.y;
  }
}
