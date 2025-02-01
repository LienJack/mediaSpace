import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './module/user/user.module';
import { MediaModule } from './module/media/media.module';
import { CommentModule } from './module/comment/comment.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [UserModule, MediaModule, CommentModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
