import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './module/user/user.module';
import { MediaModule } from './module/media/media.module';
import { CommentModule } from './module/comment/comment.module';
import { PrismaService } from './prisma/prisma.service';
import { LoggerModule } from './module/logger/logger.module';
import { WinstonModule } from 'nest-winston';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { winstonConfig } from './config/winston.config';

@Module({
  imports: [
    LoggerModule,
    UserModule,
    MediaModule,
    CommentModule,
    WinstonModule.forRoot(winstonConfig),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
