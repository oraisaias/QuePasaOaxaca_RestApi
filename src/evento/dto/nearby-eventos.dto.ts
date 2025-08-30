import {
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  Min,
  Max,
  IsUUID,
} from 'class-validator';

export enum TimeFilter {
  TODAY = 'today',
  THIS_WEEKEND = 'this_weekend',
  NEXT_WEEK = 'next_week',
}

export enum SortBy {
  PROXIMITY = 'proximity',
  TIME = 'time',
}

export enum Suggestion {
  NEAR_ME = 'near_me',
  CENTER = 'center',
  POPULAR = 'popular',
  NEW = 'new',
}

export class NearbyEventosDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  lng: number;

  @IsOptional()
  @IsString()
  searchQuery?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categories?: string[];

  @IsOptional()
  @IsEnum(TimeFilter)
  time?: TimeFilter;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(50000)
  proximity?: number;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;

  @IsOptional()
  @IsEnum(Suggestion)
  suggestion?: Suggestion;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
