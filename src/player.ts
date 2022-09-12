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

import { Sprite, keyPressed, GameObjectClass, collides } from 'kontra';
import { Level } from './level';
import { Camera } from './camera';
import { Platform } from './elements';
// @ts-ignore
import { playTune, SFX_JUMP, SFX_END } from './music.js';

const SPEED = 7;
const SPEED_WHEN_CLIMBING = 2;
const JUMP_VELOCITY = -20;
const CLIMB_SPEED = 6;
const DEADLY_FALLING_SPEED = 40;

const OFF_LEDGE_JUMP_DELAY_MS = 200;

const GRAVITY = 1;

const STANDING_WIDTH = 30;
const STANDING_HEIGHT = 90;

interface LadderCollision {
  collision: boolean;
  collidesHigh: boolean;
}

enum State {
  OnPlatform,
  Falling,
  Dropping,
  Climbing,
  Dead,
}

const playerImageWidth = 30;
const playerImageHeight = 90;

export class Player extends GameObjectClass {
  private xVel = 0; // Horizontal velocity
  public yVel = 0; // Vertical velocity, affected by jumping and gravity

  private latestOnPlatformTime = 0;
  private state: State = State.OnPlatform;
  private fallingToGround = false;
  private stopClimbing = false;
  private moveLeft = false;
  private moveLeftFoot = 0;
  private walkingSpeed = 5;

  // eslint-disable-next-line
  public died: () => void = () => {};

  constructor(private level: Level) {
    super({
      width: STANDING_WIDTH,
      height: STANDING_HEIGHT,
    });
  }

  isOnGround(): boolean {
    const margin = 5;
    return this.y + this.height > this.level.height - margin;
  }

  isDead(): boolean {
    return this.state === State.Dead;
  }

  die(): void {
    if (this.state !== State.Dead) {
      this.state = State.Dead;
      this.died();
      playTune(SFX_END);
    }
  }

  resurrect(): void {
    if (this.state === State.Dead) {
      this.state = State.OnPlatform;
      this.width = STANDING_WIDTH;
      this.height = STANDING_HEIGHT;
      this.xVel = 0;
      this.yVel = 0;
      this.fallingToGround = false;
      this.stopClimbing = false;
    }
  }

  draw(): void {
    const context = this.context;
    context.save();

    if (this.isDead() || this.fallingToGround) {
      // Rotation is around top left corner, adjust accordingly:
      context.translate(0, this.height);
      context.rotate(-Math.PI / 2);
    } else if (this.state === State.Climbing) {
      if (this.moveLeftFoot < 5) {
        // this.image = playerverticalImage;
      } else {
        // this.image = playerverticalLeftfootImage;
      }
    } else {
      if (this.moveLeft) {
        context.translate(playerImageWidth / 2, 0);
        context.scale(-1, 1); // mirror player
        context.translate(-playerImageWidth / 2, 0);
      }
      if (this.moveLeftFoot < this.walkingSpeed) {
        // this.image = playerImage;
      } else {
        // this.image = playerLeftfootImage;
      }
    }
    if (this.moveLeftFoot > this.walkingSpeed * 2) this.moveLeftFoot = 0;

    // scale image to player size
    context.scale(
      STANDING_WIDTH / playerImageWidth,
      STANDING_HEIGHT / playerImageHeight,
    );
    // context.drawImage(this.image, 0, 0);
    context.fillStyle = 'orange';
    context.fillRect(0, 0, playerImageWidth, 20);
    context.fillRect(0, 24, playerImageWidth, playerImageHeight - 24);

    context.restore();
  }

  private findLadderCollision(ladders: Array<Sprite>): LadderCollision {
    let collision = false,
      collidesHigh = false;

    for (let i = 0; i < ladders.length; i++) {
      const ladder = ladders[i];

      if (collides(ladder, this)) {
        collision = true;

        if (ladder.y < this.y && this.y < ladder.y + ladder.height) {
          // Top of the player sprite is on ladder
          collidesHigh = true;
        }
      }
    }

    return { collision, collidesHigh };
  }

  hit(velocity: number): void {
    if (Math.abs(this.xVel) < 100) {
      this.xVel += velocity;
    }
  }

  customUpdate(
    ladders: Array<Sprite>,
    platforms: Array<Platform>,
    camera: Camera,
  ): void {
    if (this.state === State.Dead) {
      // Fall down
      if (this.y + this.height < this.level.height) {
        this.yVel += GRAVITY;
        this.y += this.yVel;
      }
      return;
    }

    const now = performance.now();

    const platform = this.findPlatform(platforms);
    if (platform) {
      this.latestOnPlatformTime = now;
    }

    let movement = { dx: 0, dy: 0 };

    const ladderCollision = this.findLadderCollision(ladders);

    if (!ladderCollision.collision && this.state === State.Climbing) {
      this.state = State.Falling;
    } else if (this.yVel > DEADLY_FALLING_SPEED) {
      if (!this.fallingToGround) {
        this.fallingToGround = true;
        this.turnHorizontally();
      }
    } else if (!this.fallingToGround) {
      movement = this.handleControls(now, ladderCollision, platform);
    }

    let { dx, dy } = movement;

    if (this.xVel !== 0) {
      dx += this.xVel;
      if (Math.abs(this.xVel) > 4) {
        this.xVel *= 0.97; // friction
      } else {
        this.xVel = 0;
      }
    }

    if (this.state === State.Falling) {
      this.yVel += GRAVITY;
      dy += this.yVel;
    }

    this.updateHorizontalPosition(dx);
    this.updateVerticalPosition(camera, platform, dy);
  }

  private screenShake(camera: Camera): void {
    const topVel = 80;
    const maxPower = 20;
    const scaledPower =
      (Math.min(topVel, Math.max(this.yVel - 20, 0)) / topVel) * maxPower;
    camera.shake(scaledPower, 0.5);
  }

  private turnHorizontally(): void {
    const oldWidth = this.width,
      oldHeight = this.height;
    this.width = oldHeight;
    this.height = oldWidth;
  }

  private handleControls(
    now: number,
    ladderCollision: LadderCollision,
    platform: Platform | undefined,
  ): { dx: number; dy: number } {
    let dx = 0;
    let dy = 0;

    if ((keyPressed('arrowleft') || keyPressed('a')) && this.x > 0) {
      dx = this.state === State.Climbing ? -SPEED_WHEN_CLIMBING : -SPEED;
      this.moveLeft = true;
      if (this.state !== State.Falling) this.moveLeftFoot++;
    } else if (
      (keyPressed('arrowright') || keyPressed('d')) &&
      this.x < this.level.width - this.width
    ) {
      dx = this.state === State.Climbing ? SPEED_WHEN_CLIMBING : SPEED;
      this.moveLeft = false;
      if (this.state !== State.Falling) this.moveLeftFoot++;
    }

    const upPressed = keyPressed('arrowup') || keyPressed('w');
    const downPressed = keyPressed('arrowdown') || keyPressed('s');

    if (!upPressed) {
      // Up key must be released to jump after reaching the top of
      // the stairs.
      this.stopClimbing = false;
    }
    if (upPressed && !this.stopClimbing) {
      if (
        this.state === State.Climbing &&
        dx === 0 &&
        platform &&
        !ladderCollision.collidesHigh
      ) {
        // Prevent jumping when reaching the top of the ladder,
        // unless another ladder continues from there.
        this.state = State.OnPlatform;
        this.stopClimbing = true;
      } else if (
        (platform ||
          now - this.latestOnPlatformTime < OFF_LEDGE_JUMP_DELAY_MS ||
          this.isOnGround()) &&
        !(dx === 0 && ladderCollision.collidesHigh)
      ) {
        playTune(SFX_JUMP);
        this.yVel = JUMP_VELOCITY;
        this.state = State.Falling;
        this.latestOnPlatformTime = 0;
      } else if (this.yVel >= 0 && ladderCollision.collision) {
        // Climb when not jumping
        this.state = State.Climbing;
        this.yVel = 0;
        dy -= CLIMB_SPEED;
      }
      if (this.state === State.Climbing) this.moveLeftFoot++;
    } else if (downPressed && ladderCollision.collision) {
      this.state = State.Climbing;
      this.yVel = 0;
      dy += CLIMB_SPEED;
      this.moveLeftFoot++;
    } else if (downPressed && platform) {
      this.state = State.Dropping;
      this.dropStartTime = now;
      dy = this.height + 25;
    }

    return { dx, dy };
  }

  private updateHorizontalPosition(dx: number): void {
    if (this.x + dx > this.level.width - this.width) {
      this.x = this.level.width - this.width;
      this.xVel = 0;
    } else if (this.x + dx < this.level.left) {
      this.x = this.level.left;
      this.xVel = 0;
    } else if (dx !== 0) {
      this.x += dx;
    }
  }

  private updateVerticalPosition(
    camera: Camera,
    platform: Platform | undefined,
    dy: number,
  ): void {
    if (this.y + dy > this.level.height - this.height) {
      // hits ground
      this.y = this.level.height - this.height;

      if (this.fallingToGround) {
        this.screenShake(camera);
        this.die();
      } else {
        this.state = State.OnPlatform;
      }

      this.yVel = 0;
    } else if (this.fallingToGround) {
      this.state = State.Falling;
      this.y += dy;
    } else if (this.state === State.Dropping) {
      this.y += dy;
      this.state = State.Falling;
    } else if (this.state === State.Climbing) {
      this.y += dy;
    } else if (dy > 0 && platform) {
      // Margin so that the player does not constantly toggle
      // between standing and free falling.
      const margin = 5;
      this.y = platform.y - this.height + margin;
      this.yVel = 0;
      this.state = State.OnPlatform;
    } else {
      this.state = State.Falling;
      this.y += dy;
    }
  }

  private findPlatform(platforms: Array<Platform>): Platform | undefined {
    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i];
      if (collides(this, platform)) {
        if (this.y + this.height < platform.y + platform.height) {
          return platform;
        }
      }
    }

    return undefined;
  }
}
