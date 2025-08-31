import { IsEnum, IsNumber, Min, Max } from 'class-validator';

export enum DateFilter {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  ALL = 'all',
}

export enum DistanceFilter {
  FIVE = 5,
  TWENTY = 20,
  FIFTY = 50,
}

export class FilteredEventsDto {
  @IsEnum(DateFilter)
  date: DateFilter;

  @IsEnum(DistanceFilter)
  distance: DistanceFilter;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

export class FilteredEventResponseDto {
  id: string;
  titulo: string;
  distance: number;
  lat: number;
  lng: number;
}
