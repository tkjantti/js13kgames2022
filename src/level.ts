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

const ROOM_HEIGHT = 300;

const TIME_AS_GHOST = 5000;

const ENEMY_WAWE_INTERVAL = 10000;
const ENEMY_WAWE_SIZE = 4;

function collidesFromAbove(player: Player, enemy: Enemy): boolean {
  const playerCenterY = player.y + player.height / 2;
  const isAbove = playerCenterY < enemy.y;
  return isAbove;
}

export class Level implements Area {
  public number = 0;

  public x = 0;
  public y = 0;

  public left = 0;
  public top = 0;
  public width = 2400;
  public height = 2700;

  public score = 0;
  public lives = 3;

  public isFinished = false;

  public camera: Camera | undefined;

  public player: Player = new Player(this);

  private ghost: Ghost | undefined;

  private enemies: Array<Enemy> = [];
  private enemyWaweCount = 0;

  private ladders: Array<Sprite> = [];
  private platforms: Array<Platform> = [];

  private lastEnemyAddTime: number;

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

  getMultiplier(): number {
    if (this.player.y > this.height - 1 * ROOM_HEIGHT) {
      return 1;
    }
    if (this.player.y > this.height - 2 * ROOM_HEIGHT) {
      return 2;
    }
    if (this.player.y > this.height - 3 * ROOM_HEIGHT) {
      return 3;
    }
    if (this.player.y > this.height - 4 * ROOM_HEIGHT) {
      return 4;
    }
    if (this.player.y > this.height - 5 * ROOM_HEIGHT) {
      return 5;
    }
    if (this.player.y > this.height - 6 * ROOM_HEIGHT) {
      return 6;
    }
    if (this.player.y > this.height - 7 * ROOM_HEIGHT) {
      return 7;
    }
    if (this.player.y > this.height - 8 * ROOM_HEIGHT) {
      return 8;
    }
    if (this.player.y > this.height - 9 * ROOM_HEIGHT) {
      return 9;
    }

    return 10;
  }

  isOver(): boolean {
    return this.lives <= 0;
  }

  constructor(number: number) {
    this.number = number;
    this.lastEnemyAddTime = performance.now();

    if (number >= 1) {
      this.fill();

      this.player.x = 100;
      this.player.y = this.height - this.player.height;

      this.addEnemies();

      this.player.died = (): void => {
        this.lives--;

        if (this.lives > 0) {
          const ghost = new Ghost(this);
          ghost.x = this.player.x;
          ghost.y = this.player.y;
          this.ghost = ghost;
          if (this.camera) {
            this.camera.follow(this.ghost);
          }
        } else {
          this.ghost = undefined;
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

  private addEnemies(): void {
    const roomCountY = this.height / ROOM_HEIGHT;

    const newEnemies: Array<Enemy> = [];

    for (let i = 0; i < ENEMY_WAWE_SIZE; i++) {
      // Enemies closer to the player at start.
      const yi = this.enemyWaweCount === 0 ? 1 : Math.floor(random(roomCountY));

      const y = this.height - yi * ROOM_HEIGHT;

      if (y - ROOM_HEIGHT < this.player.y && this.player.y < y) {
        // skip if in the same area as player.
        continue;
      }

      const patrolingArea: Area = {
        x: 0,
        y: y - ROOM_HEIGHT,
        width: this.width,
        height: ROOM_HEIGHT,
      };

      const enemy = new Enemy(patrolingArea, this.player, this.enemyWaweCount);
      enemy.x = random(this.width);
      enemy.y = y - ROOM_HEIGHT / 2;

      const enemyIndex = newEnemies.length;
      enemy.alarmed = (target: Vector): void => {
        for (let i = 0; i < newEnemies.length; i++) {
          if (i !== enemyIndex) {
            const other = newEnemies[i];
            const r = 700;
            const adjustedTarget = Vector(
              target.x + randomMinMax(-r, r),
              target.y + randomMinMax(-r, r),
            );
            other.goTo(adjustedTarget);
          }
        }
      };

      newEnemies.push(enemy);
    }

    this.enemies = this.enemies.concat(newEnemies);
    this.enemyWaweCount++;
  }

  private fill(): void {
    const roomWidth = 400;

    const roomCountX = this.width / roomWidth;
    const roomCountY = this.height / ROOM_HEIGHT;

    const platformWidth = ((roomCountX - 1) * roomWidth) / 2;

    for (let yi = 1; yi < roomCountY; yi++) {
      const y = this.height - yi * ROOM_HEIGHT;

      const left = new Platform();
      left.width = platformWidth;
      left.x = 0;
      left.y = y;
      this.platforms.push(left);

      const right = new Platform();
      right.width = platformWidth;
      right.x = this.width - platformWidth - 100;
      right.y = y;
      this.platforms.push(right);

      if (yi < 3) {
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
      } else if (yi < 4) {
        for (let xi = 1; xi < 3; xi++) {
          const ladder = new Ladder();
          ladder.x = xi * roomWidth - 200;
          ladder.y = left.y;
          this.ladders.push(ladder);
        }

        for (let xi = 4; xi < roomCountX - 1; xi++) {
          const ladder = new Ladder();
          ladder.x = xi * roomWidth + 200;
          ladder.y = left.y;
          this.ladders.push(ladder);
        }
      } else if (yi < 5) {
        for (let xi = 1; xi < 3; xi++) {
          const ladder = new Ladder();
          ladder.x = xi * roomWidth - 100;
          ladder.y = left.y;
          this.ladders.push(ladder);
        }

        for (let xi = 4; xi < roomCountX - 1; xi++) {
          const ladder = new Ladder();
          ladder.x = xi * roomWidth + 200;
          ladder.y = left.y;
          this.ladders.push(ladder);
        }
      } else if (yi < 6) {
        for (let xi = 1; xi < 2; xi++) {
          const ladder = new Ladder();
          ladder.x = xi * roomWidth + 10;
          ladder.y = left.y;
          this.ladders.push(ladder);
        }

        for (let xi = 5; xi < roomCountX; xi++) {
          const ladder = new Ladder();
          ladder.x = xi * roomWidth + 10;
          ladder.y = left.y;
          this.ladders.push(ladder);
        }
      } else if (yi < 7) {
        for (let xi = 2; xi < 3; xi++) {
          const ladder = new Ladder();
          ladder.x = xi * roomWidth + 10;
          ladder.y = left.y;
          this.ladders.push(ladder);
        }

        for (let xi = 4; xi < roomCountX - 1; xi++) {
          const ladder = new Ladder();
          ladder.x = xi * roomWidth + 10;
          ladder.y = left.y;
          this.ladders.push(ladder);
        }
      }
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

        if (enemy.isDead()) {
          continue;
        }

        if (collides(this.player, enemy)) {
          if (collidesFromAbove(this.player, enemy)) {
            enemy.die();
            this.score += this.getMultiplier();
          } else {
            this.player.die();
          }
        }
      }
    }

    if (now - this.lastEnemyAddTime > ENEMY_WAWE_INTERVAL) {
      this.addEnemies();
      this.lastEnemyAddTime = now;
    }
  }
}
