// src/csv/csv.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CsvService } from './csv.service';
import { Data, DataSchema } from './schemas/data.schema';
import { CsvController } from './csv.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Data.name, schema: DataSchema }]),
    HttpModule,
  ],
  providers: [CsvService],
  controllers: [CsvController],
})
export class CsvModule {}
