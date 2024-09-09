import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Data extends Document {
  @Prop()
  locationid: string;

  @Prop()
  Applicant: string;

  @Prop()
  FacilityType: string;

  @Prop()
  cnn: string;

  @Prop()
  LocationDescription: string;

  @Prop()
  Address: string;

  @Prop()
  blocklot: string;

  @Prop()
  block: string;

  @Prop()
  lot: string;

  @Prop()
  permit: string;

  @Prop()
  Status: string;

  @Prop()
  FoodItems: string;

  @Prop()
  X: string;

  @Prop()
  Y: string;

  @Prop()
  Latitude: string;

  @Prop()
  Longitude: string;

  @Prop()
  Schedule: string;

  @Prop()
  dayshours: string;

  @Prop()
  NOISent: string;

  @Prop()
  Approved: string;

  @Prop()
  Received: string;

  @Prop()
  PriorPermit: string;

  @Prop()
  ExpirationDate: string;

  @Prop()
  Location: string;

  @Prop()
  FirePreventionDistricts: string;

  @Prop()
  PoliceDistricts: string;

  @Prop()
  SupervisorDistricts: string;

  @Prop()
  ZipCodes: string;

  @Prop()
  NeighborhoodsOld: string;
}

export const DataSchema = SchemaFactory.createForClass(Data);
DataSchema.index({ FoodItems: 'text' }); // Create a text index on FoodItems
