import 'dotenv/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');

import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const usarHttps = process.env.USE_HTTPS === 'true';
  let opcionesHttps: any = undefined;

  if (usarHttps) {
    const rutaLlave = process.env.SSL_KEY_PATH
      ? path.resolve(process.cwd(), process.env.SSL_KEY_PATH)
      : null;
    const rutaCertificado = process.env.SSL_CERT_PATH
      ? path.resolve(process.cwd(), process.env.SSL_CERT_PATH)
      : null;

    if (
      rutaLlave &&
      rutaCertificado &&
      fs.existsSync(rutaLlave) &&
      fs.existsSync(rutaCertificado)
    ) {
      opcionesHttps = {
        key: fs.readFileSync(rutaLlave),
        cert: fs.readFileSync(rutaCertificado),
      };
      console.log('Servidor configurado para iniciar en modo HTTPS local.');
    } else {
      console.warn(
        'Advertencia: USE_HTTPS es true pero no se especificaron rutas de certificados válidas o los archivos no existen.',
      );
    }
  }

  const app = await NestFactory.create(AppModule, {
    httpsOptions: opcionesHttps,
  });

  app.use(cookieParser());

  const originsPermitidos = (
    process.env.FRONTEND_URL ?? 'http://localhost:4200,https://localhost:4200'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || originsPermitidos.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origen no permitido por CORS'), false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const puerto = Number(process.env.PORT ?? 3000);
  await app.listen(puerto, '0.0.0.0');
  console.log(
    `Aplicación ejecutándose en: ${usarHttps && opcionesHttps ? 'https' : 'http'}://0.0.0.0:${puerto}`,
  );
}
bootstrap();
