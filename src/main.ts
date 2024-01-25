import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Client, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const client = new Client({
    authStrategy: new LocalAuth(),
  });

  client.on('qr', (qr) => {
    console.log('QR RECEIVED');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    console.log('Client is ready!');
  });

  client.on('message', async (msg) => {
    console.log('MESSAGE RECEIVED', msg);

    if (msg.body == 'ping') {
      msg.reply('pong');
    }

    //si el mensaje comienza con / detecta y responde el mensaje
    if (msg.body.startsWith('/')) {
      //utiliza la api de openai que un bot asistente personal responda el mensaje de la mejor manera posible
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Eres mi asistente personal que responde cualquier mensaje que me envien y eres experto en todo lo que se te pregunte si no sabes algo te lo inventas.',
          },
          {
            role: 'user',
            content: msg.body,
          },
        ],
        max_tokens: 150,
        temperature: 0.9,
        top_p: 1,
      });
      const reply = response.choices[0].message.content.replace(/<|>/gi, '');
      msg.reply(reply);
    }
  });

  await client.initialize();
  await app.listen(3000);
  console.log('Server is running on port 3000');
}

bootstrap();
