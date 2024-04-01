import { config } from 'dotenv';

config();

export const HTTP_PORT = process.env.PORT ?? 3000;
