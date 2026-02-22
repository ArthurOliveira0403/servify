import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Exception } from 'src/shared/exception';
import { ZodValidatorPipeException } from '../exceptions/zod-validator-pipe.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    if (!(exception instanceof Exception)) {
      this.logger.error(exception);

      response.status(500).send({
        statusCode: 500,
        message: 'Internal Server Error',
      });

      return;
    }

    if (exception instanceof ZodValidatorPipeException) {
      this.logger.error(
        { message: exception.message, zodError: exception.zodError },
        exception.stack,
        exception.context,
      );

      response.status(exception.statusCode).send({
        statusCode: exception.statusCode,
        message: exception.externalMessage,
        timeStamp: exception.timeStamp,
      });

      return;
    }

    this.logger.error(
      { message: exception.message, cause: exception.cause },
      exception.stack,
      exception.context,
    );

    response.status(exception.statusCode).send({
      statusCode: exception.statusCode,
      message: exception.externalMessage,
      timeStamp: exception.timeStamp,
    });

    return;
  }
}
