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

import { GameLoop, onKey, initKeys } from 'kontra';
import { renderBigNumber, renderLives, renderTexts } from './ui';
import { Level } from './level';
import { Camera } from './camera';

const maxLevel = 1;

enum State {
  Loading,
  Running,
  LevelFinished,
}

let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;

let levelNumber = 0;
let state = State.Loading;

let gameLoop: GameLoop;
let level: Level;
let camera: Camera;

const createStartScreenLoop = (): GameLoop => {
  return GameLoop({
    render(): void {
      context.clearRect(0, 0, canvas.width, canvas.height);

      if (state === State.Loading) {
        renderStartScreen('Loading.............          ');
      } else {
        renderStartScreen('Press enter to start          ');
      }
    },
  });
};

const createGameLoop = (): GameLoop => {
  return GameLoop({
    update(): void {
      level.update(camera);
      camera.update();

      if (level.isFinished && state === State.Running) {
        state = State.LevelFinished;
        setTimeout(() => {
          levelNumber++;
          startLevel(levelNumber);
        }, 1500);
      }
    },

    render(): void {
      context.save();
      context.translate(canvas.width / 2, canvas.height / 2);
      context.scale(camera.zoom, camera.zoom);
      context.translate(-camera.x, -camera.y);

      level.render(context, camera);

      context.restore();

      renderLives(context, level.lives);

      const timeLeft = level.getTimeAsGhost();

      if (level.isOver()) {
        renderTexts(context, 'GAME OVER!', 'Press enter to try again');
      } else if (timeLeft != null) {
        renderTexts(context, 'Continue as ghost for a while!');
        renderBigNumber(context, timeLeft);
      }
    },
  });
};

const listenKeys = (): void => {
  onKey('enter', () => {
    if (levelNumber === 0) {
      levelNumber = 1;
      startLevel(levelNumber);
    } else {
      levelNumber = 0;
      startLevel(levelNumber);
    }
  });
  onKey('esc', () => {
    levelNumber = 0;
    startLevel(levelNumber);
  });

  // Keys for debugging
  onKey('1', () => {
    camera.follow(level.player);
  });
  onKey('2', () => {
    camera.zoomToLevel();
  });
  onKey('n', () => {
    if (levelNumber < 4) levelNumber++;
    else levelNumber = 1;
    startLevel(levelNumber);
  });
};

const startLevel = (number: number): void => {
  gameLoop.stop();

  level = new Level(number);
  camera = new Camera(level, canvas);
  level.camera = camera;

  if (number === 0) {
    gameLoop = createStartScreenLoop();
  } else {
    camera.follow(level.player);
    gameLoop = createGameLoop();
  }

  state = State.Running;
  gameLoop.start();
};

const renderStartScreen = (lastText: string): void => {
  renderTexts(
    context,
    'JS13kGames 2022 Entry                                     ',
    '',
    'Controls                                                   ',
    'Use ARROWS or W/A/S/D to move. Jump with UP or W.          ',
    '',
    '(c) 2022 by Sami H & Tero J          ',
    '',
    lastText,
  );
};

export const initializeGame = (
  canvasReference: HTMLCanvasElement,
  contextReference: CanvasRenderingContext2D,
): void => {
  canvas = canvasReference;
  context = contextReference;
  state = State.Loading;

  initKeys();
  level = new Level(0);
  camera = new Camera(level, canvas);

  levelNumber = 0;
  gameLoop = createStartScreenLoop();
  gameLoop.start();
};

export const startGame = (): void => {
  state = State.Running;

  listenKeys();
};
