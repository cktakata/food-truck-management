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
  await app.listen(3000);
}
bootstrap();
