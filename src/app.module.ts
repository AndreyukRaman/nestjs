import { Module } from '@nestjs/common';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { TagModule } from '@app/tag/tag.module';
import ormconfig from '@app/ormconfig';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@app/user/user.module';

@Module({
  imports: [TypeOrmModule.forRoot(ormconfig), TagModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
