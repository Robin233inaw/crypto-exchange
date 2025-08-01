import { ExceptionFilter, Catch, ArgumentsHost, Logger } from "@nestjs/common";
import { HttpException } from "src/common/exceptions/http-exception";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {

    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        this.logger.error(
            `Error: ${exception.message}`,
            `Status: ${exception.statusCode}`,
            `Path: ${request.url}`,
            `Timestamp: ${new Date().toISOString()}`
        );

        response.status(exception.statusCode).json({
            statusCode: exception.statusCode,
            message: exception.message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
