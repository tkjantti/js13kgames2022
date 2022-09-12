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
import { Area } from './area';
import { Player } from './player';

const SPEED = 3;

type State =
  | { type: 'patrol' }
  | { type: 'alarm'; start: number }
  | { type: 'goto'; target: Vector }
  | { type: 'attack'; start: number }
  | { type: 'dead' };

function getFlashingColor(now: number): string {
  return Math.floor(now / 500) % 2 === 0
    ? 'rgba(255, 0, 0, 0.9)'
    : 'rgba(255, 255, 255, 0.9';
}

export class Enemy extends GameObjectClass {
  private state: State = { type: 'patrol' };

  // eslint-disable-next-line
  alarmed: (target: Vector) => void = () => {};

  constructor(private area: Area, private player: Player, wawe: number) {
    super({
      width: 30,
      height: 30,
      dx: SPEED,
    });
    const red = Math.min(160 + wawe * 5, 240);
    this.color = 'rgb(' + red + ', 50, 50)';
  }

  goTo(point: Vector): void {
    this.state = { type: 'goto', target: point };
  }

  die(): void {
    this.state = { type: 'dead' };
  }

  isDead(): boolean {
    return this.state.type === 'dead';
  }

  update(): void {
    const now = performance.now();

    switch (this.state.type) {
      case 'dead':
        break;
      case 'alarm': {
        if (now - this.state.start > 2000) {
          this.state = { type: 'patrol' };
        }
        break;
      }
      case 'patrol': {
        this.patrol();
        const player = this.player;
        if (!player.isDead() && this.position.distance(player.position) < 200) {
          this.state = { type: 'alarm', start: now };
          this.dx = 0;
          this.dy = 0;
          this.alarmed(Vector(player.x, player.y));
        }
        break;
      }
      case 'goto': {
        const target = this.state.target;
        if (this.position.distance(target) > 100) {
          this.moveTowards(target);
        } else {
          this.state = { type: 'attack', start: now };
          this.dx = 0;
          this.dy = 0;
        }
        break;
      }
      case 'attack': {
        const player = this.player;
        if (!player.isDead() && this.position.distance(player.position) < 350) {
          this.moveTowards(player.position);
        } else if (now - this.state.start > 4000) {
          this.state = { type: 'patrol' };
        }
        break;
      }
    }

    this.advance();
  }

  draw(): void {
    const now = performance.now();
    const context = this.context;
    context.save();
    const w = this.width * 1.4;
    const h = this.height;
    switch (this.state.type) {
      case 'dead':
        break;
      case 'alarm':
        context.fillStyle = getFlashingColor(now);

        context.fillRect(0, h / 2, w, h / 2);

        context.beginPath();
        context.arc(w / 2, h / 2, w / 2, 0, 2 * Math.PI);
        context.fill();
        break;
      default:
        context.fillStyle = 'rgba(255, 255, 255, 0.9)';
        context.fillRect(0, h / 2, w, h / 2);

        context.beginPath();
        context.arc(w / 2, h / 2, w / 2, 0, 2 * Math.PI);
        context.fill();

        break;
    }

    context.restore();
  }

  private patrol(): void {
    const y = this.area.y + this.area.height / 2;
    if (this.y < y - 10) {
      this.dy = SPEED;
    } else if (y + 10 < this.y) {
      this.dy = -SPEED;
    } else if (this.dy !== 0) {
      this.dy = 0;
    }

    if (this.dx === 0) {
      this.dx = SPEED;
    } else if (this.dx < 0 && this.x <= this.area.x + 2 * this.width) {
      this.dx = SPEED;
    } else if (
      this.dx > 0 &&
      this.area.x + this.area.width - 2 * this.width <= this.x
    ) {
      this.dx = -SPEED;
    }
  }

  private moveTowards(target: Vector): void {
    const direction = target.subtract(this.position).normalize().scale(SPEED);
    this.dx = direction.x;
    this.dy = direction.y;
  }
}
