import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl: url } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // 记录请求参数
    this.logger.log(
      `REQUEST - ${method} ${url} - Body: ${JSON.stringify(
        request.body,
      )} - Query: ${JSON.stringify(request.query)}`,
    );

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const duration = Date.now() - startTime;

      // 记录响应结果
      this.logger.log(
        `RESPONSE - ${method} ${url} ${statusCode} ${contentLength}B - ${duration}ms`,
      );
    });

    next();
  }
}
