import { Injectable, EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';


@Injectable({
  providedIn: 'root'
})
export class PushService {

  mensajes: OSNotificationPayload[] = [
    /* {
      title: 'titulo push',
      body: 'body de push',
      date: new Date()
    } */
  ];

  pushListener = new EventEmitter<OSNotificationPayload>();

  userId: string;

  constructor(  private oneSignal: OneSignal,
                private storage: Storage ) {
                  this.cargarMensajes();
                }

  configuracionInicial() {
    this.oneSignal.startInit(
      'OneSignal App ID',
      'FCM Send ID'
    );

    this.oneSignal.inFocusDisplaying(
      this.oneSignal.OSInFocusDisplayOption.Notification
    );

    this.oneSignal.handleNotificationReceived().subscribe(( notif ) => {
      // do something when notification is received
      console.log('notificacion recibida', notif);
      this.notificacionRecibida(notif);
    });

    this.oneSignal.handleNotificationOpened().subscribe( async( notif ) => {
      // do something when a notification is opened
      console.log('notificacion abierta', notif);
      await this.notificacionRecibida(notif.notification);
    });

    this.oneSignal.getIds().then( info => {
      this.userId = info.userId;
      console.log(this.userId);
    });

    this.oneSignal.endInit();
  }

  async notificacionRecibida( noti: OSNotification ) {

    await this.cargarMensajes();

    const payload = noti.payload;

    const existePush = this.mensajes.find( mensaje =>
      mensaje.notificationID === payload.notificationID
    );

    if ( existePush ) {
      return;
    }

    this.mensajes.unshift(payload);

    this.pushListener.emit(payload);

    await this.guardarMensajes();
  }

  async getMensajes() {
    await this.cargarMensajes();
    return [...this.mensajes];
  }

  guardarMensajes() {
    this.storage.set('mensajes', this.mensajes);
  }

  async cargarMensajes() {
    // this.storage.clear();
    this.mensajes = await this.storage.get('mensajes') || [];

    return this.mensajes;
  }

  async borrarMensajes() {
    await this.storage.clear();
    this.mensajes = [];
    this.guardarMensajes();
  }
}
