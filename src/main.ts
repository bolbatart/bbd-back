import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
    exposedHeaders: [
      'Accept',
      'authorization',
      'Content-Type',
      'If-None-Match',
      'SourceType',
      'Set-Cookie'
    ],
  })

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  
  const config = new DocumentBuilder()
    .setTitle('Bbd BE')
    .setDescription("This is BBD BE project's part")
    .setVersion('1.0')
    .addTag('be')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT);
}
bootstrap();