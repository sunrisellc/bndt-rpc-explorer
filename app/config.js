var debug = require("debug");
var debugLog = debug("btcexp:config");

var fs = require('fs');
var crypto = require('crypto');
var url = require('url');

var coins = require("./coins.js");
var credentials = require("./credentials.js");

var currentCoin = process.env.BTCEXP_COIN || "BTC";

var rpcCred = credentials.rpc;

if (rpcCred.cookie && !rpcCred.username && !rpcCred.password && fs.existsSync(rpcCred.cookie)) {
	console.log(`Loading RPC cookie file: ${rpcCred.cookie}`);
	
	[ rpcCred.username, rpcCred.password ] = fs.readFileSync(rpcCred.cookie).toString().split(':', 2);
	
	if (!rpcCred.password) {
		throw new Error(`Cookie file ${rpcCred.cookie} in unexpected format`);
	}
}

var cookieSecret = process.env.BTCEXP_COOKIE_SECRET
 || (rpcCred.password && crypto.createHmac('sha256', JSON.stringify(rpcCred))
                               .update('btc-rpc-explorer-cookie-secret').digest('hex'))
 || "0x000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f";


var electrumXServerUriStrings = (process.env.BTCEXP_ELECTRUMX_SERVERS || "").split(',').filter(Boolean);
var electrumXServers = [];
for (var i = 0; i < electrumXServerUriStrings.length; i++) {
	var uri = url.parse(electrumXServerUriStrings[i]);
	
	electrumXServers.push({protocol:uri.protocol.substring(0, uri.protocol.length - 1), host:uri.hostname, port:parseInt(uri.port)});
}

// default=false env vars
[
	"BTCEXP_DEMO",
	"BTCEXP_PRIVACY_MODE",
	"BTCEXP_NO_INMEMORY_RPC_CACHE",
	"BTCEXP_RPC_ALLOWALL"

].forEach(function(item) {
	if (process.env[item] === undefined) {
		process.env[item] = "false";

		debugLog(`Config(default): ${item}=false`)
	}
});


// default=true env vars
[
	"BTCEXP_NO_RATES",
	"BTCEXP_UI_SHOW_TOOLS_SUBHEADER",
	"BTCEXP_SLOW_DEVICE_MODE"

].forEach(function(item) {
	if (process.env[item] === undefined) {
		process.env[item] = "true";

		debugLog(`Config(default): ${item}=true`)
	}
});

module.exports = {
	coin: currentCoin,

	cookieSecret: cookieSecret,

	privacyMode: (process.env.BTCEXP_PRIVACY_MODE.toLowerCase() == "true"),
	slowDeviceMode: (process.env.BTCEXP_SLOW_DEVICE_MODE.toLowerCase() == "true"),
	demoSite: (process.env.BTCEXP_DEMO.toLowerCase() == "true"),
	queryExchangeRates: (process.env.BTCEXP_NO_RATES.toLowerCase() != "true"),
	noInmemoryRpcCache: (process.env.BTCEXP_NO_INMEMORY_RPC_CACHE.toLowerCase() == "true"),
	
	rpcConcurrency: (process.env.BTCEXP_RPC_CONCURRENCY || 10),

	rpcBlacklist:
	  process.env.BTCEXP_RPC_ALLOWALL.toLowerCase() == "true"  ? []
	: process.env.BTCEXP_RPC_BLACKLIST ? process.env.BTCEXP_RPC_BLACKLIST.split(',').filter(Boolean)
	: [
		"addnode",
		"backupwallet",
		"bumpfee",
		"clearbanned",
		"createmultisig",
		"createwallet",
		"disconnectnode",
		"dumpprivkey",
		"dumpwallet",
		"encryptwallet",
		"generate",
		"generatetoaddress",
		"getaccountaddrss",
		"getaddressesbyaccount",
		"getbalance",
		"getnewaddress",
		"getrawchangeaddress",
		"getreceivedbyaccount",
		"getreceivedbyaddress",
		"gettransaction",
		"getunconfirmedbalance",
		"getwalletinfo",
		"importaddress",
		"importmulti",
		"importprivkey",
		"importprunedfunds",
		"importpubkey",
		"importwallet",
		"invalidateblock",
		"keypoolrefill",
		"listaccounts",
		"listaddressgroupings",
		"listlockunspent",
		"listreceivedbyaccount",
		"listreceivedbyaddress",
		"listsinceblock",
		"listtransactions",
		"listunspent",
		"listwallets",
		"lockunspent",
		"logging",
		"move",
		"preciousblock",
		"pruneblockchain",
		"reconsiderblock",
		"removeprunedfunds",
		"rescanblockchain",
		"savemempool",
		"sendfrom",
		"sendmany",
		"sendtoaddress",
		"sendrawtransaction",
		"setaccount",
		"setban",
		"setmocktime",
		"setnetworkactive",
		"signmessage",
		"signmessagewithprivatekey",
		"signrawtransaction",
		"signrawtransactionwithkey",
		"stop",
		"submitblock",
		"syncwithvalidationinterfacequeue",
		"verifychain",
		"waitforblock",
		"waitforblockheight",
		"waitfornewblock",
		"walletlock",
		"walletpassphrase",
		"walletpassphrasechange",
	],

	addressApi:process.env.BTCEXP_ADDRESS_API,
	electrumXServers:electrumXServers,

	redisUrl:process.env.BTCEXP_REDIS_URL,

	site: {
		homepage:{
			recentBlocksCount:10
		},
		blockTxPageSize:20,
		addressTxPageSize:10,
		txMaxInput:15,
		browseBlocksPageSize:50,
		addressPage:{
			txOutputMaxDefaultDisplay:10
		},
		valueDisplayMaxLargeDigits: 4,
		header:{
			showToolsSubheader:(process.env.BTCEXP_UI_SHOW_TOOLS_SUBHEADER == "true"),
			dropdowns:[
				{
					title:"Related Sites",
					links:[
						{name: "Bandito Coin Website", url:"https://www.banditocoin.com", imgUrl:"/img/logo/ltcp.svg"}
					]
				}
			]
		},
		subHeaderToolsList:[0, 7, 9, 4, 8], // indexes in "siteTools" below that are shown in the site "sub menu" (visible on all pages except homepage)
		prioritizedToolIdsList: [0,1,2,3,4,5,6,7,8,9],
	},

	credentials: credentials,

	siteTools:[
	/* 0 */		{name:"Node Status", url:"/node-status", desc:"Summary of this node: version, network, uptime, etc.", fontawesome:"fas fa-broadcast-tower"},
	/* 1 */		{name:"Peers", url:"/peers", desc:"Detailed info about the peers connected to this node.", fontawesome:"fas fa-sitemap"},

	/* 2 */		{name:"Browse Blocks", url:"/blocks", desc:"Browse all blocks in the blockchain.", fontawesome:"fas fa-cubes"},
	/* 3 */		{name:"Transaction Stats", url:"/tx-stats", desc:"See graphs of total transaction volume and transaction rates.", fontawesome:"fas fa-chart-bar"},

	/* 4 */		{name:"Mempool Summary", url:"/mempool-summary", desc:"Detailed summary of the current mempool for this node.", fontawesome:"fas fa-receipt"},
	/* 5 */		{name:"Browse Pending Tx", url:"/unconfirmed-tx", desc:"Browse unconfirmed/pending transactions.", fontawesome:"fas fa-unlock"},

	/* 9 6*/		{name:"Cooking Summary", url:"/mining-summary", desc:"Summary of recent data about cooks.", fontawesome:"fas fa-chart-pie"},
	/* 10 7*/	{name:"Block Stats", url:"/block-stats", desc:"Summary data for blocks in configurable range.", fontawesome:"fas fa-layer-group"},
	/* 11 8*/	{name:"Block Analysis", url:"/block-analysis", desc:"Summary analysis for all transactions in a block.", fontawesome:"fas fa-angle-double-down"},
	/* 12 9*/	{name:"Difficulty History", url:"/difficulty-history", desc:"Graph of difficulty changes over time.", fontawesome:"fas fa-chart-line"}
	],

	donations:{
		addresses:{
			coins:["BTC"],
			sites:{"BTC":"https://explorer.btc21.org"}
		},
		btcpayserver:{
			host:"https://donate.btc21.org",
			storeId:"26k74KRh7RYmJcMDqvmdKTb2h3991FMTZSM4GJHnX6st",
			notifyEmail:"chaintools.io@gmail.com",
			customAmountUrl: "https://donate.btc21.org/apps/2TBP2GuQnYXGBiHQkmf4jNuMh6eN/pos"
		}
	}
};

debugLog(`Config(final): privacyMode=${module.exports.privacyMode}`);
debugLog(`Config(final): slowDeviceMode=${module.exports.slowDeviceMode}`);
debugLog(`Config(final): demo=${module.exports.demoSite}`);
debugLog(`Config(final): rpcAllowAll=${module.exports.rpcBlacklist.length == 0}`);
