import { Color } from 'chessground/types';
import { opposite } from 'chessground/util';
import { h } from 'snabbdom';
import { GameCtrl } from '../game';
import { Renderer } from '../interfaces';
import { clockContent } from './clock';
import '../../scss/_game.scss';
import { renderBoard, renderPlayer } from './board';

import {playerRating, playerCheck} from '../ratings'; // Adjust the path as needed







export const renderGame: (ctrl: GameCtrl) => Renderer = ctrl => _ =>
  [
    h(
      `div.game-page.game-page--${ctrl.game.id}`,
      {
        hook: {
          destroy: ctrl.onUnmount,
        },
      },
      [
        renderGamePlayer(ctrl, opposite(ctrl.pov)),
        renderBoard(ctrl),
        renderGamePlayer(ctrl, ctrl.pov),
        ctrl.playing() ? renderButtons(ctrl) : renderState(ctrl),
      ]
    ),
  ];

const renderButtons = (ctrl: GameCtrl) =>
  h('div.btn-group.mt-4', [
    h(
      'button.btn.btn-secondary',
      {
        attrs: { type: 'button', disabled: !ctrl.playing() },
        on: {
          click() {
            if (confirm('Confirm?')) ctrl.resign();
          },
        },
      },
      ctrl.chess.fullmoves > 1 ? 'resign' : 'Abort'
    ),
    
    h(
      'button.btn.btn-primary',
      {
        attrs: { type: 'button' },
        on: { click:()=> playerRating(ctrl.game[opposite(ctrl.pov)].name) },
      },
      'Show profile'
    ),

  ]);

const renderState = (ctrl: GameCtrl) => h('div.game-page__state', ctrl.game.state.status);

const renderGamePlayer = (ctrl: GameCtrl, color: Color) => {
  const p = ctrl.game[color];
  
  const clock = clockContent(
    ctrl.timeOf(color),
    color == ctrl.chess.turn && ctrl.chess.fullmoves > 1 && ctrl.playing() ? ctrl.lastUpdateAt - Date.now() : 0
  );
  


  return renderPlayer(ctrl, color, clock, p.name, p.title, p.rating, p.aiLevel);
};
