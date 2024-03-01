import cors, { CorsOptions } from 'cors';

const getApplicationAllowedOrigins = (): string[] => {
	const env = process.env.NODE_ENV;

	switch (env) {
		case 'production':
			return [
				'http://localhost:3011',
				'https://autobots.netlify.app',
				'https://autoboto.netlify.app',
			];
		case 'development':
		default:
			return [
				'http://localhost:3000',
				'http://localhost:3011',
				'https://autoboto.netlify.app',
				'https://autobots.netlify.app',
			];
	}
};

const AppliationCorsOptions: CorsOptions = {
	origin: getApplicationAllowedOrigins(),
	methods: ['PUT', 'GET', 'POST', 'OPTIONS', 'DELETE'],
	optionsSuccessStatus: 200,
};

export default cors(AppliationCorsOptions);
