import { Module } from '@nestjs/common';
import { RviaDocService } from './rviadoc.service';
import { RviaDocController } from './rviadoc.controller';
import { CommonModule } from 'src/common/common.module';

@Module({
  //controllers: [RviaDocController],
  //providers: [RviaDocService],
  imports: [
    CommonModule,
  ],
  exports:[
    // TypeOrmModule    
  ]
})
export class RviadocModule {}