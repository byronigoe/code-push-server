/* eslint-disable max-classes-per-file */
export class AppError extends Error {
    constructor(message: string | Error) {
        super(message instanceof Error ? message.message : message);
        this.name = 'AppError';
    }

    public status = 200;
}

export class NotFound extends AppError {
    constructor(message?: string | Error) {
        super(message || 'Not Found');
        this.name = 'NotFoundError';
    }

    public status = 404;
}

export class Unauthorized extends AppError {
    constructor(message?: string | Error) {
        super(message || 'Unauthorized');
        this.name = 'UnauthorizedError';
    }

    public status = 401;
}
