# Managing San Francisco's Food Trucks
## _Backend Parse Module and APi provider_

This application will extract and parse data from San Francisco's food truck open dataset and can perform some filters for the ones who loves Food Truck!!!

## API

- Import data:
```
curl --location 'localhost:8000/csv/parse?url=https%3A%2F%2Fdata.sfgov.org%2Fapi%2Fviews%2Frqzj-sfat%2Frows.csv'
```
- List all facility types:
```
curl --location 'localhost:8000/csv/facility-types'
```
- Search for specific food:
```
curl --location 'localhost:8000/csv/filter-food-items?food=burgers'
```
- Locate nearby food trucks based on geo localization:
```
curl --location 'localhost:8000/csv/nearby-food-trucks?latitude=37.762024747895126%3Flongitude%3D-122.43969849090182&facilityType=Push%20Cart&limit=5'
```

## Tech

- [NestJS] - API / Swagger / Unit Tests
- [MongoDb] - Database storage
- [Docker] - To quickly start and develop the application

## Installation

Simply run:

```sh
docker-compose up --build 
```

Open browser at:
```sh
localhost:8000/api
```

To see the swagger documentation

## Unit tests
```sh
npm run test:cov
```

## License

MIT
