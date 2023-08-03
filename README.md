<div align="center">
	<a href="https://github.com/Gabe616/VendettaCloudSync/stargazers">
		<img alt="GitHub stars" src="https://img.shields.io/github/stars/Gabe616/VendettaCloudSync?style=for-the-badge&color=b4befe&labelColor=1e1e2e&logo=starship&logoColor=fff">
	</a>
	<a href="https://github.com/Gabe616/VendettaCloudSync/issues">
		<img alt="GitHub issues" src="https://img.shields.io/github/issues/Gabe616/VendettaCloudSync?style=for-the-badge&color=74c7ec&labelColor=1e1e2e&logo=gitbook&logoColor=fff">
	</a>
	<a href="https://github.com/Gabe616/VendettaCloudSync/pulls">
		<img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/Gabe616/VendettaCloudSync?style=for-the-badge&color=a6e3a1&labelColor=1e1e2e&logo=saucelabs&logoColor=fff">
	</a>
	<a href="https://discord.gg/n9QQ4XhhJP">
		<img alt="Discord members" src="https://img.shields.io/discord/1015931589865246730?style=for-the-badge&color=eba0ac&labelColor=1e1e2e&logo=discord&logoColor=fff">
	</a>
</div>
<div align="center">
    <h1>🔧 Vendetta CloudSync</h1>
</div>

Backend for the [CloudSync](https://github.com/Gabe616/VendettaPlugins/tree/main/plugins/cloud-sync) Vendetta plugin

# Selfhosting

Requirements:

- [Discord Bot](https://discord.com/developers/applications)
- [NodeJS 18+](https://nodejs.org/en)
- [Wrangler](https://github.com/cloudflare/workers-sdk#installation)
- a brain

Steps:

1. Clone this repo
   ```sh
   git clone https://github.com/Gabe616/VendettaCloudSync
   cd VendettaCloudSync
   ```
2. Rename `.dev.vars.EXAMPLE` to `.dev.vars` and replace `CLIENT_SECRET_HERE` with your Discord bot's secret
   - also run
   ```sh
   echo YOUR_BOTS_CLIENT_SECRET | wrangler secret put client_secret
   ```
3. Rename `wrangler.toml.EXAMPLE` to `wrangler.toml`
4. Run

   ```sh
   wrangler d1 create VendettaCloudSync --experimental-backend=true
   ```

   then replace `DATABASE_ID_HERE` in `wrangler.toml` with the `database_id` wrangler returned

5. You're done! Now all you have to run is
   ```sh
   # you can also use npm or yarn of course
   pnpm i
   pnpm run publish
   ```
