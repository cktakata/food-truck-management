import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CsvModule } from './csv/csv.module';

const mongo_url = process.env.MONGO_URI + '/' + process.env.COLLECTION_NAME;
console.log(mongo_url);
@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI ? mongo_url : 'mongodb://127.0.0.1:27017/nest',
    ),
    CsvModule,
  ],
})
export class AppModule {}
