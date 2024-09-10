import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
async function bootstrap() {
  console.log(join(__dirname, '../data/local.csv'));
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle("Managing San Francisco's Food Trucks")
    .setDescription('API providers')
    .setVersion('1.0')
    .addTag('Csv Handler')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // Enable CORS with custom options
  const frontend_uri = process.env.FRONTEND_URI || 'http://localhost:3001';
  app.enableCors({
    origin: frontend_uri, // Allow only this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Allowed methods
    allowedHeaders: 'Content-Type, Accept', // Allowed headers
    credentials: true, // Allow cookies
  });

  await app.listen(8000);
}
bootstrap();
