import router from './router';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname.startsWith('/api')) return router.handle(request, env, ctx);

		return Response.redirect('https://github.com/nexpid/VendettaPlugins/tree/main/plugins/cloud-sync');
	},
};
