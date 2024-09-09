/* eslint-disable @typescript-eslint/no-var-requires */
import { Test, TestingModule } from '@nestjs/testing';
import { CsvService } from './csv.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Data } from './schemas/data.schema';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Readable } from 'stream';
import { createReadStream } from 'fs';
import { join } from 'path';

describe('CsvService', () => {
  let service: CsvService;
  let model: Model<Data>;
  let httpService: HttpService;

  const mockDataModel = {
    findOne: jest.fn(),
    updateOne: jest.fn(),
    save: jest.fn(),
    distinct: jest.fn(),
    find: jest.fn(),
  };

  const mockHttpService = {
    axiosRef: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsvService,
        {
          provide: getModelToken(Data.name),
          useValue: mockDataModel,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<CsvService>(CsvService);
    model = module.get<Model<Data>>(getModelToken(Data.name));
    httpService = module.get<HttpService>(HttpService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('fetchAndParseCsv', () => {
    it.skip('should process data from HTTP stream', async () => {
      const mockStream = Readable.from(['locationid,FoodItems\n123, Pizza\n']);
      const mockResponse: AxiosResponse = {
        data: mockStream,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: undefined,
        },
      };

      // Mock HttpService to return the mock response
      (mockHttpService.axiosRef as jest.Mock).mockResolvedValue(mockResponse);

      // Mock the Data Model methods
      mockDataModel.findOne.mockResolvedValue(null);
      mockDataModel.save.mockResolvedValue(null);

      // Ensure that the fetchAndParseCsv method processes the stream
      await service.fetchAndParseCsv('http://example.com/csv');

      // Verify that save was called with the expected arguments
      expect(mockDataModel.save).toHaveBeenCalledWith(
        expect.objectContaining({
          locationid: '123',
          FoodItems: 'Pizza',
        }),
      );
      // Ensure axiosRef was called with the correct URL
      expect(mockHttpService.axiosRef).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'http://example.com/csv',
          method: 'GET',
          responseType: 'stream',
        }),
      );
    });

    it.skip('should fall back to local file if HTTP request fails', async () => {
      const mockStream = Readable.from(['locationid,FoodItems\n123, Pizza\n']);

      // Mock HTTP request to fail
      (mockHttpService.axiosRef as jest.Mock).mockRejectedValue(
        new Error('HTTP error'),
      );

      // Mock the file read stream
      jest
        .spyOn(require('fs'), 'createReadStream')
        .mockReturnValue(mockStream as any);

      // Mock the Data Model methods
      mockDataModel.findOne.mockResolvedValue(null);
      mockDataModel.save.mockResolvedValue(null);

      // Ensure the fallback mechanism works
      await service.fetchAndParseCsv('http://example.com/csv');

      // Verify the local file stream was used
      expect(require('fs').createReadStream).toHaveBeenCalledWith(
        expect.stringContaining('local.csv'),
      );
      // Verify the data was saved
      expect(mockDataModel.save).toHaveBeenCalledWith(
        expect.objectContaining({
          locationid: '123',
          FoodItems: 'Pizza',
        }),
      );
    });
  });

  describe('getUniqueFacilityTypes', () => {
    it.skip('should return sorted unique facility types', async () => {
      // Mock distinct to return an array
      mockDataModel.distinct.mockResolvedValue(['Food Truck', 'Restaurant']);

      const result = await service.getUniqueFacilityTypes();

      expect(result).toEqual(['Food Truck', 'Restaurant']);
      expect(mockDataModel.distinct).toHaveBeenCalledWith('FacilityType');
    });
  });

  describe('filterFoodItemsByLetter', () => {
    it.skip('should return filtered food items', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([{ FoodItems: 'Pizza' }]),
      };

      mockDataModel.find.mockReturnValue(mockQuery);

      const result = await service.filterFoodItemsByLetter('Pizza');

      expect(result).toEqual([{ FoodItems: 'Pizza' }]);
      expect(mockDataModel.find).toHaveBeenCalledWith({
        FoodItems: { $regex: 'Pizza', $options: 'i' },
      });
      expect(mockQuery.sort).toHaveBeenCalledWith({ FoodItems: 1 });
    });
  });

  describe('findNearbyFoodTrucks', () => {
    it.skip('should return sorted nearby food trucks', async () => {
      const mockData = [
        { Latitude: '10', Longitude: '10', FoodItems: 'Pizza' },
        { Latitude: '20', Longitude: '20', FoodItems: 'Burger' },
      ];
      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockData),
      };

      mockDataModel.find.mockReturnValue(mockQuery);

      jest
        .spyOn(service, 'calculateDistance')
        .mockImplementation((lat1, lon1, lat2, lon2) => {
          return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
        });

      const result = await service.findNearbyFoodTrucks(0, 0);

      const expected = [
        { ...mockData[0], distance: Math.sqrt(10 * 10 + 10 * 10) },
        { ...mockData[1], distance: Math.sqrt(20 * 20 + 20 * 20) },
      ];

      expect(result).toEqual(expected.sort((a, b) => a.distance - b.distance));
      expect(mockDataModel.find).toHaveBeenCalledWith({});
    });
  });

  describe('calculateDistance', () => {
    it.skip('should correctly calculate distance', () => {
      const lat1 = 0;
      const lon1 = 0;
      const lat2 = 10;
      const lon2 = 10;

      const expectedDistance = Math.sqrt(
        Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2),
      );

      const distance = service.calculateDistance(lat1, lon1, lat2, lon2);

      expect(distance).toBeCloseTo(expectedDistance, 2); // Adjust precision if needed
    });
  });
});
