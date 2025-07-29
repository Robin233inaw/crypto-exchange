import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'postgres',
    port: 5432,
    username: 'admin',
    password: 'password',
    database: 'crypto',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true, // Только для разработки!
}