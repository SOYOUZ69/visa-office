import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RejectTransactionDto {
  @ApiProperty({
    description: 'ID of the user rejecting the transaction',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty()
  approvedBy: string;

  @ApiProperty({
    description: 'Reason for rejecting the transaction',
    example: 'Insufficient documentation provided',
  })
  @IsString()
  @IsNotEmpty()
  rejectionReason: string;
}
