import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import express, { Request, Response, NextFunction } from 'express';
import cors from './utils/cors';
import './models'
import MasterRouter from './routers/MasterRouter';
import ErrorHandler from './models/ErrorHandler';
import { connect } from 'mongoose'


dotenv.config({
	path: '.env',
});

class Server {
	public app = express();
	public router = new MasterRouter().router;
}

const mongourl: string = process.env.MONGODB_URI || ''
connect(mongourl, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('mongodb connected!')
})

const server = new Server();
server.app.use(cors);
server.app.use(bodyParser.json());
server.app.use('/api', server.router);

((port = process.env.PORT || 5000) => {
	server.app.listen(port, () => console.log(`> Listening it on port ${port}`));
})();

server.app.use(
	(err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
		res.status(err.statusCode || 500).json({
			status: 'error',
			statusCode: err.statusCode,
			message: err.message,
		});
	},
);
