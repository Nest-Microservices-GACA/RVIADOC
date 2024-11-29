import { Module } from '@nestjs/common';
import { RviadocService } from './rviadoc.service';
import { RviadocController } from './rviadoc.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, NATS_SERVICE } from 'src/config';
import { Scan } from './entities/scan.entity';
import { Checkmarx } from './entities/checkmarx.entity';

@Module({
  controllers: [RviadocController],
  providers: [RviadocService],
  imports:[
    TypeOrmModule.forFeature([ Checkmarx, Scan ]),
    CommonModule,
    ClientsModule.register([
      { 
        name: NATS_SERVICE, 
        transport: Transport.NATS,
        options: {
          servers: envs.natsServers
        }
      },
    ]),
  ],

})
export class RviadocModule {}
