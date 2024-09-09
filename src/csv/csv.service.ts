import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Data } from './schemas/data.schema';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { parse } from 'fast-csv';
import { createReadStream } from 'fs';
import { join } from 'path';

@Injectable()
export class CsvService {
  constructor(
    @InjectModel(Data.name) private dataModel: Model<Data>,
    private httpService: HttpService,
  ) {}

  async fetchAndParseCsv(url: string): Promise<void> {
    try {
      const response: AxiosResponse = await this.httpService.axiosRef({
        url,
        method: 'GET',
        responseType: 'stream',
      });

      await this.processStream(response.data);
    } catch (error) {
      console.error(
        'Error fetching CSV from URL, falling back to local file:',
        error.message,
      );

      const localStream = createReadStream(join(__dirname, 'local.csv'));
      await this.processStream(localStream);
    }
  }

  private async processStream(stream: NodeJS.ReadableStream): Promise<void> {
    stream
      .pipe(parse({ headers: true }))
      .on('data', async (row) => {
        const existingData = await this.dataModel
          .findOne({ locationid: row.locationid })
          .exec();
        if (row.status === 'APPROVED') {
          if (existingData) {
            const isDifferent = Object.keys(row).some(
              (key) => row[key] !== existingData[key],
            );
            if (isDifferent) {
              await this.dataModel
                .updateOne({ locationid: row.locationid }, row)
                .exec();
            }
          } else {
            const newData = new this.dataModel(row);
            await newData.save();
            console.log(`New data with locationid ${row.locationid} saved`);
          }
        }
      })
      .on('end', () => {
        console.log('CSV file successfully processed');
      });
  }

  async getUniqueFacilityTypes(): Promise<string[]> {
    return this.dataModel.distinct('FacilityType').sort();
  }

  async filterFoodItemsByLetter(food: string): Promise<Data[]> {
    const regex = new RegExp(food, 'i'); // 'i' for case-insensitive search
    return this.dataModel
      .find({ FoodItems: { $regex: regex } })
      .sort({ FoodItems: 1 });
  }

  async findNearbyFoodTrucks(
    latitude: number,
    longitude: number,
    facilityType?: string,
    foodItems?: string,
    limit?: number,
  ): Promise<any[]> {
    const query: any = {};

    if (facilityType) {
      query.FacilityType = facilityType;
    }

    if (foodItems) {
      query.FoodItems = { $regex: foodItems, $options: 'i' };
    }

    const data = await this.dataModel.find(query);

    const sortedData = data
      .map((item) => ({
        ...item.toObject(),
        distance: this.calculateDistance(
          latitude,
          longitude,
          parseFloat(item.Latitude),
          parseFloat(item.Longitude),
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    // Return only the limited number of results if limit is specified
    return limit ? sortedData.slice(0, limit) : sortedData;
  }

  public calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }
}
