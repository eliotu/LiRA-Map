
import * as tunnel from 'tunnel-ssh';
import knex from 'knex'

import { RideMeta, RidePos } from './models'
import { getRides, getRide } from './db_query';

import * as dotenv from "dotenv";
dotenv.config( { path: __dirname + '/.env' } );

const env = process.env;

const { SSH_USERNAME, SSH_PASSWORD, DB_USER, DB_PASSWORD } = env;

const SSH_HOSTNAME = "thinlinc.compute.dtu.dk";
const SSH_PORT = 22;

const DB_NAME = "postgres";
const DB_HOST = "liradbdev.compute.dtu.dk";
const DB_PORT = 5432;

const LOCALHOST = "127.0.0.1"
const LOCALPORT = 3333


const SSH_CONFIG = {
	host: SSH_HOSTNAME,
	port: SSH_PORT,
	username: SSH_USERNAME,
	password: SSH_PASSWORD,
	keepaliveInterval: 60000,
	keepAlive: true,
	dstHost: DB_HOST,
	dstPort: DB_PORT,
	localHost: LOCALHOST,
	localPort: LOCALPORT
};

const DATABASE_CONFIG = {
    client: 'postgres',
    connection: {
          host : LOCALHOST,
          port: LOCALPORT,
          user : DB_USER,
          password : DB_PASSWORD,
          database : DB_NAME,
    },
    pool: {
        min: 2,
        max: 6,
        "createTimeoutMillis": 3000,
        "acquireTimeoutMillis": 30000,
        "idleTimeoutMillis": 30000,
        "reapIntervalMillis": 1000,
        "createRetryIntervalMillis": 100,
        "propagateCreateError": false
    }
}


export const db = (app: any) => {
    const tnl = tunnel.default(SSH_CONFIG, async (err: any, server: any) => {
        if (err) console.error("TUNNEL CREATION ERROR", err);

        const database = knex(DATABASE_CONFIG);

        app.post("/ride", async (req: any, res: any) => {
            const TRIP_ID = req.body.tripID; // '7f67425e-26e6-4af3-9a6f-f72ff35a7b1a';
            console.log("Requested ride ", TRIP_ID);
            const data: RidePos = await getRide(database, TRIP_ID );
            res.json( data );
        } )

        app.get("/rides", async (req: any, res: any) => {
            const data: RideMeta[] = await getRides(database)
            res.json( data )
         } )
    })

    console.log(tnl);


    tnl.on('error', (err) => { console.error('Something bad happened:', err); } );

    process.on("SIGHUP", () =>  { tnl.close(); console.log("TUNNEL CLOSING"); });
    process.on("SIGUSR2", () =>  { tnl.close(); console.log("TUNNEL CLOSING 2"); });
}



export default { db }
