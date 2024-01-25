import { Injectable } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

export class WhatsAppBot {
  public client: Client;
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
    });
    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      console.log('Client is ready!');
    });

    this.client.initialize();
  }
}
