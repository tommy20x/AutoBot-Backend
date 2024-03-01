import { Router } from 'express';
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from '../config/jsdoc';
import ContractRouter from './contractRouter';

class MasterRouter {
	private _router = Router();
	private _contractRouter = ContractRouter;
	private _swaggerSpec = swaggerJsDoc;

	get router() {
		return this._router;
	}

	constructor() {
		this._configure();
	}

	private _configure() {		
		this._router.get("/", (req, res) => {
			res.send('hello')
		});
		this._router.use("/contract", this._contractRouter);
		this._router.use(
			'/swagger',
			swaggerUI.serve,
			swaggerUI.setup(this._swaggerSpec),
		);
	}
}

export default MasterRouter;
