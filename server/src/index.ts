
import express from 'express';
import * as http from 'http';
import fs from 'fs'

import databaseQuery from './database'
import osrmQuery from './osrm';

import { DataPath, RideMeta } from "./models";
import { getRides, getTest, getMeasurementData } from './queries'

import initWebsockets from './websockets';
import measurements from './measurements.json';
import { writeJsonFile } from './file';

import tripsRoutes from "./routes/tripsRoutes";
import measurementsRoutes from "./routes/measurementsRoutes";
import segmentsRoutes from "./routes/segmentsRoutes";

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.urlencoded({
	extended: true
}))

app.use(express.json({
	type: ['application/json', 'text/plain'],
	limit: '200mb'
}))

app.use( (req, res, next) => {
	console.log(`[${req.method}] ${req.path}`, req.query, req.body);
	next()
})



app.use('/trips', tripsRoutes);
app.use('/segments', segmentsRoutes);


app.post('/push_file', async (req: any, res: any) => {
	const { filename, content } = req.body;
	await writeJsonFile(filename, content);
	res.json({status: 'ok'})
})


app.get('/measurements', async (req: any, res: any) => {
	res.json( measurements );
} )

app.put('/addmeasurement', async (req: any, res: any) => {
	const measurement = req.body.params;
	const updatedFile = [...measurements, measurement]
	fs.writeFile('./src/measurements.json', JSON.stringify(updatedFile, null, 4), 'utf8',
		() => console.log('[PUT] /addmeasurement Added Measurement to the json file')
	);
	res.json()
})

app.put('/editmeasurement', async (req: any, res: any) => {
	const { index, measurement } = req.body.params;
	const updatedFile = [...measurements]
	updatedFile[index] = measurement
	fs.writeFile('./src/measurements.json', JSON.stringify(updatedFile, null, 4), 'utf8',
		() => console.log('[PUT] /editmeasurement Edited Measurement', measurement,'to the json file')
	);
	res.json()
})

app.get("/map_match", async (req: any, res: any) => {
	const { tripID } = req.query;
	const path: DataPath = await databaseQuery<DataPath>(getMeasurementData, tripID, 'track.pos')
	const data: any = await osrmQuery(path);
	res.json( data );
} )

app.get("/trip_measurement", async (req: any, res: any) => {
	const tripID = req.query.tripID
	const measurement = req.query.measurement
	const data: DataPath = await databaseQuery<DataPath>(getMeasurementData, tripID, measurement)
	res.json( data );
} )

app.get("/rides", async (req: any, res: any) => {
	const data: RideMeta[] = await databaseQuery<RideMeta[]>(getRides, '')
	res.json( data )
} )

app.get("/test", async (req: any, res: any) => {
	const data: any[] = await databaseQuery<any[]>(getTest, '')
	res.json( data )
} )


app.get("/login",(req,res) => {
	const { user, email, pass } = req.body
	res.json( { status: "ok" } );
});


const server = http.createServer(app);

// start our server
server.listen( PORT, () => {
	console.log(`Server listening on ${PORT}`);
	initWebsockets(server)
});