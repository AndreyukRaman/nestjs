import { PostgresDataSourceOptions } from 'typeorm/driver/postgres/PostgresDataSourceOptions'

const config: PostgresDataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'mediumclone',
  password: '123',
  database: 'mediumclone',
};

export default config;
