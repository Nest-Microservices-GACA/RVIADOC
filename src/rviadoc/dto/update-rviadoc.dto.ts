import { PartialType } from '@nestjs/mapped-types';
import { CreateRviadocDto } from './create-rviadoc.dto';

export class UpdateRviadocDto extends PartialType(CreateRviadocDto) {}
