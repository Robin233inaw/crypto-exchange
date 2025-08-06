import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Crypto Exchange API')
    .setDescription('API для криптообменника')
    .setVersion('1.0')
    .addBearerAuth() // Для JWT-авторизации в Swagger
    .build();

  const document = SwaggerModule.createDocument(app, config);

  document.servers = [
    { url: 'http://localhost:3000', description: 'Development server' },
  ];

  SwaggerModule.setup('api/docs', app, document);
      
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
