// src/csv/csv.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { CsvService } from './csv.service';
import { FilterFoodItemsDto, ParseCsvDto } from './dto/csv.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Food Truck')
@Controller('csv')
export class CsvController {
  constructor(private readonly csvService: CsvService) {}

  @Get('parse')
  @ApiResponse({ status: 200, description: 'CSV parsing initiated' })
  async parseCsv(@Query('url') url: ParseCsvDto) {
    await this.csvService.fetchAndParseCsv(url.toString());
    return { message: 'CSV parsing initiated' };
  }

  @Get('facility-types')
  @ApiResponse({ status: 200, description: 'Success' })
  async getUniqueFacilityTypes() {
    const facilityTypes = await this.csvService.getUniqueFacilityTypes();
    return { facilityTypes };
  }

  @Get('filter-food-items')
  @ApiResponse({ status: 200, description: 'Success' })
  async filterFoodItemsByLetter(@Query('food') food: FilterFoodItemsDto) {
    const data = await this.csvService.filterFoodItemsByLetter(food.toString());
    return { data };
  }

  @Get('nearby-food-trucks')
  @ApiResponse({ status: 200, description: 'Success' })
  async findNearbyFoodTrucks(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('facilityType') facilityType?: string,
    @Query('foodItems') foodItems?: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.csvService.findNearbyFoodTrucks(
      latitude,
      longitude,
      facilityType,
      foodItems,
      limit,
    );
    return { data };
  }
}
