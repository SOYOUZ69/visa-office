import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ApproveTransactionDto {
  @ApiProperty({
    description: 'ID of the user approving the transaction',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty()
  approvedBy: string;
}
