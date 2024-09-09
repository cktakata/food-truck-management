import { Test, TestingModule } from '@nestjs/testing';
import { CsvController } from './csv.controller';
import { CsvService } from './csv.service';
import { ParseCsvDto, FilterFoodItemsDto } from './dto/csv.dto';

describe('CsvController', () => {
  let csvController: CsvController;
  let csvService: CsvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CsvController],
      providers: [
        {
          provide: CsvService,
          useValue: {
            fetchAndParseCsv: jest.fn(),
            getUniqueFacilityTypes: jest.fn(),
            filterFoodItemsByLetter: jest.fn(),
            findNearbyFoodTrucks: jest.fn(),
          },
        },
      ],
    }).compile();

    csvController = module.get<CsvController>(CsvController);
    csvService = module.get<CsvService>(CsvService);
  });

  it('should be defined', () => {
    expect(csvController).toBeDefined();
  });

  describe('parseCsv', () => {
    it('should initiate CSV parsing', async () => {
      const url = new ParseCsvDto();
      url.url = 'http://example.com/csv';
      await csvController.parseCsv(url);
      expect(csvService.fetchAndParseCsv).toHaveBeenCalledWith(url.toString());
    });
  });

  describe('getUniqueFacilityTypes', () => {
    it('should return unique facility types', async () => {
      const result = ['Type1', 'Type2'];
      jest
        .spyOn(csvService, 'getUniqueFacilityTypes')
        .mockResolvedValue(result);
      expect(await csvController.getUniqueFacilityTypes()).toEqual({
        facilityTypes: result,
      });
    });
  });

  describe('filterFoodItemsByLetter', () => {
    it('should filter food items by letter', async () => {
      const food = new FilterFoodItemsDto();
      food.food = 'A';
      const result = ['Apple', 'Avocado'];
      jest
        .spyOn(csvService, 'filterFoodItemsByLetter')
        .mockResolvedValue(result as any);
      expect(await csvController.filterFoodItemsByLetter(food)).toEqual({
        data: result,
      });
    });
  });

  describe('findNearbyFoodTrucks', () => {
    it('should find nearby food trucks', async () => {
      const result = [{ name: 'Truck1' }, { name: 'Truck2' }];
      jest.spyOn(csvService, 'findNearbyFoodTrucks').mockResolvedValue(result);
      expect(
        await csvController.findNearbyFoodTrucks(1, 2, 'Type', 'Food', 10),
      ).toEqual({ data: result });
    });
  });
});
