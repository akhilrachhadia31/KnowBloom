import pino from 'pino';

const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const logger = pino({ level });

export default logger;
