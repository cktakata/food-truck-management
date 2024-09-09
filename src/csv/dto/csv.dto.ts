import { ApiProperty } from '@nestjs/swagger';

export class ParseCsvDto {
  @ApiProperty({
    description: 'The url to get data from',
    default: 'https://data.sfgov.org/api/views/rqzj-sfat/rows.csv',
  })
  url: string;
}

export class FilterFoodItemsDto {
  @ApiProperty({
    description: 'The food to look for',
    default: 'Burgers',
  })
  food: string;
}

export class NearbyFoodTruckDto {
  @ApiProperty({
    description: 'The user Latitude',
    default: '37.762024747895126',
  })
  latitude: number;
  @ApiProperty({
    description: 'The user Longitude',
    default: '122.43969849090182',
  })
  longitude: number;
  @ApiProperty({
    description: 'Facility Type',
    default: 'Truck',
  })
  facilityType: string;
  @ApiProperty({
    description: 'The food to look for',
    default: 'Burgers',
  })
  foodItems: string;
  @ApiProperty({
    description: 'The maximum number of records',
    default: '122.43969849090182',
  })
  limit: number;
}
