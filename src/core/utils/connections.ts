import { createClient } from 'redis';
import { Sequelize } from 'sequelize';
import { config } from '../config';

export const sequelize = new Sequelize(
    config.db.database,
    config.db.username,
    config.db.password,
    config.db,
);

export const redisClient = createClient({
    socket: {
        host: config.redis.host,
        port: config.redis.port,
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                return new Error('Retry count exhausted');
            }

            return retries * 100;
        },
    },
    password: config.redis.password,
    database: config.redis.db,
});
redisClient.connect();
