import { Color } from 'chessground/types';
import { opposite } from 'chessground/util';
import { array, h } from 'snabbdom';
import { GameCtrl } from '../game';
import { Game, Renderer } from '../interfaces';
import { clockContent } from './clock';
import '../../scss/_game.scss';
import { renderBoard, renderPlayer } from './board';

import {playerRating, playerCheck} from '../ratings'; // Adjust the path as needed
import {Chat } from '../chat';








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

  
  interface ChatData {
    username: string;
    text: string;
    // Add any other necessary properties here
  }
 


  
  const getResult = async (ctrl: GameCtrl) => {
    return await playerRating(ctrl.game[opposite(ctrl.pov)].name);
  };
  
  



  const renderButtons = (ctrl: GameCtrl) =>
  h('div', [
    h('div.stats', [
      h(
        'div',
        {
          // Add style to the chat display
          style: {
            border: '1px solid #ccc',
            padding: '10px',
            minHeight: '100px',
            maxHeight: '200px',
            overflow: 'auto',
          },
        },
        'Enemy Profile: \n'
        //  Chat.load(ctrl.game.id) // Assuming Chat.load returns an array of chat messages
      )
    ]),
    h('div.moves', [
      h(
        'div',
        {
          // Add style to the chat display
          style: {
            border: '1px solid #ccc',
            padding: '10px',
            minHeight: '100px',
            maxHeight: '200px',
            overflow: 'auto',
          },
        },
        'Moves: \n'
        //  Chat.load(ctrl.game.id) // Assuming Chat.load returns an array of chat messages
      )
    ]),
    h('div.chat', [
      h(
        'div',
        {
          // Add style to the chat display
          style: {
            border: '1px solid #ccc',
            padding: '10px',
            minHeight: '100px',
            maxHeight: '200px',
            overflow: 'auto',
          },
        },
        'Chat: \n'
        
      )
    ]),
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
          on: {
            click: async () => {
              try {
                const ratings = await playerRating(ctrl.game[opposite(ctrl.pov)].name);
                
                
              } catch (error) {
                console.error(error);
              }
            }
          }
        },
        'Show profile'
      ),
      h(
        'button.btn.btn-primary',
        {
          attrs: { type: 'button' },
          on: {
            click: async () => {
              try {
                await playerCheck(ctrl.game.id);
                //alert(ctrl.game.id)
                
              } catch (error) {
                console.error(error);
              }
            }
          }
        },
        'Show profile enemy'
      ),
      h(
        'button.btn.btn-primary',
        {
          attrs: { type: 'button' },
          on: {
            click: async () => {
              try {
                const ratings = await playerRating('cabadas22');
                
                
              } catch (error) {
                console.error(error);
              }
            }
          }
        },
        'Show profile cabadass'
      ),
      h(
        'button.btn.btn-secondary',
        {
          attrs: { type: 'button' },
          on: {
            click: async () => {
              try {
                await Chat.send(ctrl.game.id, 'player', 'GL & HF');
                
              } catch (error) {
                console.error(error);
              }
            }
          }
        },
        'Send GL & HF'
      )
    ])
  ]);



const renderState = (ctrl: GameCtrl) => h('div.game-page__state', ctrl.game.state.status);

const renderGamePlayer = (ctrl: GameCtrl, color: Color) => {
  const p = ctrl.game[color];
  
  const clock = clockContent(
    ctrl.timeOf(color),
    color == ctrl.chess.turn && ctrl.chess.fullmoves > 1 && ctrl.playing() ? ctrl.lastUpdateAt - Date.now() : 0
  );
  
  // getResult(ctrl).then(result => {
  //   // Use the result here
  //   alert(result);
  // }).catch(error => {
  //   // Handle errors if necessary
  //   console.error(error);
  // });
    

  return renderPlayer(ctrl, color, clock, p.name, p.title, p.rating, p.aiLevel);
};
