import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as socketIo from 'socket.io-client';

export class SocketService {
  getCookie(cname) {
   var name = cname + "=";
   var decodedCookie = decodeURIComponent(document.cookie);
   var ca = decodedCookie.split(';');
   for(var i = 0; i <ca.length; i++) {
       var c = ca[i];
       while (c.charAt(0) == ' ') {
           c = c.substring(1);
       }
       if (c.indexOf(name) == 0) {
           return c.substring(name.length, c.length);
       }
   }
   return "";
}

  token = this.getCookie("id_token");
  private socket = socketIo('https://167.99.246.26:3000', {
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
