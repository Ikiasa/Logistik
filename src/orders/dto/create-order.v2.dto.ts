import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsUUID,
} from "class-validator";
import { Type } from "class-transformer";

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  number: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  postal_code: string;

  @IsString()
  @IsNotEmpty()
  country_code: string; // ISO 3166-1 alpha-2
}

export class CreateOrderDtoV2 {
  @IsUUID()
  @IsOptional() // Client can provide ID or let backend generate
  tenant_id?: string;

  @IsString()
  @IsNotEmpty()
  customer_name: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  delivery_address: AddressDto;

  // ... other order fields (items, weight, etc.)
}
