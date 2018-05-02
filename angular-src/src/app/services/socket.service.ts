import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as socketIo from 'socket.io-client';

export class SocketService {
  token = localStorage.getItem('id_token');
  private socket = socketIo('http://localhost:3000', {
    query: {token: this.token}
  });

  sendMessage(message){
    this.socket.emit('send message', message);
  }

  getMessages() {
    let observable = new Observable(observer => {
      this.socket.on('receive message', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    })
    return observable;
  }

}
