import { Test, TestingModule } from '@nestjs/testing';
import { CsvService } from './csv.service';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { Data } from './schemas/data.schema';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { parse } from 'fast-csv';
import { Readable } from 'stream';

// Mock Model and HttpService
const mockModel = () => ({
  findOne: jest.fn(),
  updateOne: jest.fn(),
  save: jest.fn(),
  distinct: jest.fn(),
  find: jest.fn(),
});

const mockHttpService = () => ({
  axiosRef: jest.fn(),
});

describe('CsvService', () => {
  let service: CsvService;
  let dataModel: Model<Data>;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsvService,
        { provide: HttpService, useFactory: mockHttpService },
        { provide: 'DataModel', useFactory: mockModel },
      ],
    }).compile();

    service = module.get<CsvService>(CsvService);
    httpService = module.get<HttpService>(HttpService);
    dataModel = module.get<Model<Data>>('DataModel');
  });

  describe('fetchAndParseCsv', () => {
    it.skip('should successfully fetch and process CSV data', async () => {
      const mockStream = new Readable({
        read() {
          this.push('locationid,FacilityType,FoodItems,Latitude,Longitude\n');
          this.push('1,TypeA,FoodX,12.34,56.78\n');
          this.push(null);
        },
      });

      const mockResponse: AxiosResponse = {
        data: mockStream,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };

      jest
        .spyOn(httpService, 'axiosRef')
        .mockResolvedValue(mockResponse as any);

      jest.spyOn(dataModel, 'findOne').mockResolvedValue(null as any);
      jest.spyOn(dataModel, 'bulkSave').mockResolvedValue({} as any);
      await service.fetchAndParseCsv('http://example.com/file.csv');

      expect(httpService.axiosRef).toHaveBeenCalledWith({
        url: 'http://example.com/file.csv',
        method: 'GET',
        responseType: 'stream',
      });
      expect(dataModel.bulkSave).toHaveBeenCalled();
    });

    it.skip('should fall back to local file on error', async () => {
      jest
        .spyOn(httpService, 'axiosRef')
        .mockRejectedValue(new Error('Network Error'));

      jest.spyOn(dataModel, 'findOne').mockResolvedValue(null as any);
      jest.spyOn(dataModel, 'bulkSave').mockResolvedValue({} as any);

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      jest.spyOn(require('fs'), 'createReadStream').mockReturnValue(
        new Readable({
          read() {
            this.push('locationid,FacilityType,FoodItems,Latitude,Longitude\n');
            this.push('1,TypeA,FoodX,12.34,56.78\n');
            this.push(null);
          },
        }),
      );

      await service.fetchAndParseCsv('http://example.com/file.csv');

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      expect(require('fs').createReadStream).toHaveBeenCalledWith(
        expect.stringContaining('local.csv'),
      );
      expect(dataModel.bulkSave).toHaveBeenCalled();
    });
  });

  describe('getUniqueFacilityTypes', () => {
    it.skip('should return unique facility types sorted', async () => {
      jest
        .spyOn(dataModel, 'distinct')
        .mockResolvedValue(['TypeA', 'TypeB'] as any);

      const result = await service.getUniqueFacilityTypes();

      expect(result).toEqual(['TypeA', 'TypeB']);
      expect(dataModel).toHaveBeenCalledWith('FacilityType');
    });
  });

  describe('filterFoodItemsByLetter', () => {
    it.skip('should return food items filtered by letter', async () => {
      jest
        .spyOn(dataModel, 'find')
        .mockResolvedValue([{ FoodItems: 'FoodX' }] as any);

      const result = await service.filterFoodItemsByLetter('X');

      expect(result).toEqual([{ FoodItems: 'FoodX' }]);
      expect(dataModel.find).toHaveBeenCalledWith({
        FoodItems: { $regex: new RegExp('X', 'i') },
      });
    });
  });

  describe('findNearbyFoodTrucks', () => {
    it.skip('should return nearby food trucks sorted by distance', async () => {
      jest.spyOn(dataModel, 'find').mockResolvedValue([
        {
          Latitude: '12.34',
          Longitude: '56.78',
          FacilityType: 'TypeA',
          FoodItems: 'FoodX',
        } as any,
      ]);

      jest.spyOn(service, 'calculateDistance').mockReturnValue(5);

      const result = await service.findNearbyFoodTrucks(
        12.34,
        56.78,
        'TypeA',
        'FoodX',
        10,
      );

      expect(result).toEqual([
        {
          Latitude: '12.34',
          Longitude: '56.78',
          FacilityType: 'TypeA',
          FoodItems: 'FoodX',
          distance: 5,
        },
      ]);
    });
  });
});
