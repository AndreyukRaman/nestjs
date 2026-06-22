import { PostgresDataSourceOptions } from 'typeorm/driver/postgres/PostgresDataSourceOptions'

const config: PostgresDataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'mediumclone',
  password: process.env.DB_PASSWORD || '123',
  database: process.env.DB_NAME || 'mediumclone',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

export default config;
