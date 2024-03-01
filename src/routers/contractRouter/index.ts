import { Response, Router } from 'express';
import LedgerController from '../../controllers/contractController';

class ContractRouter {
	private _router = Router();
	private _controller = LedgerController;

	get router() {
		return this._router;
	}

	constructor() {
		this._configure();
	}

	private _configure() {
		this._router.get('/entrypoints', async (req, res) => {
			const entrypoints = await this._controller.getEntrypoints();
			return res.status(200).json({
				success: true,
				entrypoints
			});
		});

		this._router.delete('/entrypoints/:id', async (req, res) => {
			const entrypoints = await this._controller.deleteEntrypoint(req.params.id);
			return res.status(200).json({
				success: true,
				entrypoints
			});
		});

		this._router.post('/entrypoints', async (req, res) => {
			const entrypoints = await this._controller.saveEntrypoints(req.body);
			const success = entrypoints !== null;
			return res.status(200).json({success: success, entrypoints});
		});
	}
}
export = new ContractRouter().router;
