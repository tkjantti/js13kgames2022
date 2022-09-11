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
import { collides, Sprite, Vector } from 'kontra';
import { Player } from './player';
import { Enemy } from './enemy';
import { random, randomMinMax } from './utils';
import { Area } from './area';
import { Ghost } from './ghost';

const TIME_AS_GHOST = 5000;

export class Level implements Area {
  public number = 0;

  public x = 0;
  public y = 0;

  public left = 0;
  public top = 0;
  public width = 2400;
  public height = 2300;

  public isFinished = false;

  public camera: Camera | undefined;

  public player: Player = new Player(this);

  private ghost: Ghost | undefined;

  private enemies: Array<Enemy> = [];

  private ladders: Array<Sprite> = [];
  private platforms: Array<Platform> = [];

  getTimeAsGhost(): number | undefined {
    if (!this.ghost) {
      return undefined;
    }

    return (
      Math.floor(
        (TIME_AS_GHOST - (performance.now() - this.ghost.startTime)) / 1000,
      ) + 1
    );
  }

  constructor(number: number) {
    this.number = number;

    if (number >= 1) {
      this.fill();

      this.player.x = 100;
      this.player.y = this.height - this.player.height;

      this.player.died = () => {
        const ghost = new Ghost(this);
        ghost.x = this.player.x;
        ghost.y = this.player.y;
        this.ghost = ghost;
        if (this.camera) {
          this.camera.follow(this.ghost);
        }
      };
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

    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      enemy.render();
    }

    this.player.render();

    if (this.ghost) {
      this.ghost.render();
    }

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

    const platformWidth = ((roomCountX - 1) * roomWidth) / 2;

    for (let yi = 1; yi < roomCountY; yi++) {
      const y = this.height - yi * roomHeight;

      const left = new Platform();
      left.width = platformWidth;
      left.x = 0;
      left.y = y;
      this.platforms.push(left);

      const right = new Platform();
      right.width = platformWidth;
      right.x = this.width - platformWidth;
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

      const patrolingArea: Area = {
        x: 0,
        y: y - roomHeight,
        width: this.width,
        height: roomHeight,
      };

      const enemy = new Enemy(patrolingArea, this.player);
      enemy.x = random(this.width);
      enemy.y = y - roomHeight / 2;

      const enemyIndex = this.enemies.length;
      enemy.alarmed = (target: Vector): void => {
        for (let i = 0; i < this.enemies.length; i++) {
          if (i !== enemyIndex) {
            const other = this.enemies[i];
            const r = 700;
            const adjustedTarget = Vector(
              target.x + randomMinMax(-r, r),
              target.y + randomMinMax(-r, r),
            );
            other.goTo(adjustedTarget);
          }
        }
      };
      this.enemies.push(enemy);
    }
  }

  update(camera: Camera): void {
    const now = performance.now();

    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      enemy.update();
    }

    this.player.customUpdate(this.ladders, this.platforms, camera);

    if (this.ghost) {
      this.ghost.update();

      if (now - this.ghost.startTime > TIME_AS_GHOST) {
        this.player.x = this.ghost.x;
        this.player.y = this.ghost.y;
        this.player.resurrect();

        this.ghost = undefined;

        camera.follow(this.player);
      }
    }

    if (!this.player.isDead()) {
      for (let i = 0; i < this.enemies.length; i++) {
        const enemy = this.enemies[i];
        if (collides(enemy, this.player)) {
          this.player.die();
        }
      }
    }
  }
}
