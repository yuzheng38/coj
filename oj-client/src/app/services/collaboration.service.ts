import { Injectable } from '@angular/core';
import { COLORS } from '../../assets/colors';

declare const io: any;
declare const ace: any;

@Injectable()
export class CollaborationService {
  collaborationSocket: any;
  clientsInfo: Object;
  clientNum: number;

  constructor() {
    this.clientsInfo = {};
    this.clientNum = 0;
  }

  init(editor: any, sessionId: string): void{
    // client init handshake
    this.collaborationSocket = io(window.location.origin, {query: 'sessionId=' + sessionId});
 
    // textchange event listener .. this also covers restoreBuffer event
    this.collaborationSocket.on('textChange', (delta: string) => {
      console.log('collaboration: editor change ' + delta);  // this is editor change by others. 
      delta = JSON.parse(delta);
      editor.lastAppliedChange = delta;
      editor.getSession().getDocument().applyDeltas([delta]);
    });

    // cursormove event listener
    this.collaborationSocket.on('cursorMove', (cursor) => {
      const session = editor.getSession();
      cursor = JSON.parse(cursor);
      const x = cursor['row'];
      const y = cursor['column'];
      const changeClientId = cursor['socketId'];

      if(changeClientId in this.clientsInfo){
        session.removeMarker(this.clientsInfo[changeClientId]['marker']);
      }else{
        this.clientsInfo[changeClientId] = {};
        // creating the cursor element and appending to HTML. 
        const css = document.createElement('style');
        css.type = 'text/css';
        css.innerHTML = '.editor_cursor_' + changeClientId
          + '{'
          + 'position: absolute;'
          + 'background: ' + COLORS[this.clientNum % 30] + ';'
          + 'z-index: 100;'
          + 'width: 3px !important;'
          + '}';
        this.clientNum++;
        document.body.appendChild(css);
      }

      const Range = ace.require('ace/range').Range;
      const newMarker = session.addMarker(new Range(x, y, x, y+1),
                                          'editor_cursor_' + changeClientId,
                                          true);
      this.clientsInfo[changeClientId]['marker'] = newMarker;
      
    });

    this.collaborationSocket.on('newConnected', (socketId, numOfParticipants) => {
      console.log(socketId, ' just joined the session. there are ', numOfParticipants, ' participants');
    });

    // disconnected event listener - handling server response of disconnect event
    this.collaborationSocket.on('disconnected', (socketId, numOfParticipants) => {
      console.log(socketId, ' just left the session. there are ', numOfParticipants, ' clients left');
      // this.clientNum--;
      delete this.clientsInfo[socketId];
    });
  }

  change(delta: string): void {
    this.collaborationSocket.emit('textChange', delta);
  }

  cursorMove(cursor: string): void {
    this.collaborationSocket.emit('cursorMove', cursor);
  }

  restoreBuffer(): void {
    this.collaborationSocket.emit('restoreBuffer');
  }

  alertOthers(): void {
    this.collaborationSocket.emit('newConnected');
  }

  // create a blur event listener
  // create a focus event listener
  // create a search event listener
}
