import { Test, TestingModule } from '@nestjs/testing';
import { CsvService } from './csv.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Data } from './schemas/data.schema'; // Ensure correct import path
import { HttpService } from '@nestjs/axios';
import { jest } from '@jest/globals';

// Define a type for the mock execution function
type MockExecFn = jest.Mock<Promise<Data[]>>;

// Create a mock function for distinct
const mockDistinct = jest.fn() as jest.Mock<Promise<string[]>, [string]>;

// Create a mock exec function for the model
const mockExec = jest.fn() as MockExecFn;

// Create a mock find method that returns an object with an exec method
const mockFind = jest.fn(() => ({
  exec: mockExec,
})) as unknown as jest.Mock<{ exec: () => Promise<Data[]> }, [any]>;

// Create a mock HttpService
const mockHttpService = {
  axiosRef: jest.fn(),
} as unknown as HttpService;

// Define the mock data model with the distinct and find methods
const mockDataModel = {
  distinct: mockDistinct,
  find: mockFind,
} as unknown as Model<Data>;

describe('CsvService', () => {
  let service: CsvService;

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
  });

  describe('getUniqueFacilityTypes', () => {
    it('should return a sorted array of unique facility types', async () => {
      const mockFacilityTypes = ['Food Truck', 'Restaurant', 'Cafe'];
      mockDistinct.mockResolvedValue(mockFacilityTypes);

      const result = await service.getUniqueFacilityTypes();

      expect(result).toEqual(mockFacilityTypes.sort()); // Sort the expected result
      expect(result).toHaveLength(mockFacilityTypes.length);
      expect(result).toEqual(expect.arrayContaining(mockFacilityTypes));
      expect(mockDistinct).toHaveBeenCalledWith('FacilityType');
      expect(mockDistinct).toHaveBeenCalledTimes(1);
    });
  });
});
