// Retrieving feeds data
const data = require('./data/feeds.json');

// Parse arguments
// --program - [Required] The account address for your deployed program.
// --feed - The account address for the Chainlink data feed to retrieve
const args = require('minimist')(process.argv.slice(2));
console.log(args);

// Initialize Anchor and provider
const anchor = require("@project-serum/anchor");
const provider = anchor.AnchorProvider.env();
// Configure the cluster.
anchor.setProvider(provider);

const CHAINLINK_PROGRAM_ID = "HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny";
const DIVISOR = 100000000;

// Data feed account address
// Default is SOL / USD
const DEFAULT_FEED = "SOL/USD";
const FEED_HASH = data.feeds[args['feed'] || DEFAULT_FEED];
const CHAINLINK_FEED = FEED_HASH;

const opts = {
  "commitment": "confirmed"
}

async function main() {
  // Read the generated IDL.
  const idl = JSON.parse(
    require("fs").readFileSync("./target/idl/solana.json", "utf8")
  );

  // Address of the deployed program.
  const programId = new anchor.web3.PublicKey(args['program']);

  // Generate the program client from IDL.
  const program = new anchor.Program(idl, programId);

  //create an account to store the price data
  const priceFeedAccount = anchor.web3.Keypair.generate();

  const feedPubKey = priceFeedAccount.publicKey;
  const walletPubKey = provider.wallet.publicKey;
  console.log('priceFeedAccount public key: ' + feedPubKey);
  console.log('user public key: ' + walletPubKey);

  // Execute the RPC.
  let tx = await program.rpc.execute({
    accounts: {
      decimal: priceFeedAccount.publicKey,
      user: provider.wallet.publicKey,
      chainlinkFeed: CHAINLINK_FEED,
      chainlinkProgram: CHAINLINK_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId
    },
    options: { commitment: "confirmed" },
    signers: [priceFeedAccount],
  });
  console.log(tx);

  console.log("Fetching transaction logs...");
  let t = await provider.connection.getTransaction(tx, opts);
  
  console.log(t.meta);
  // #endregion main

  // Fetch the account details of the account containing the price data
  const latestPrice = await program.account.decimal.fetch(priceFeedAccount.publicKey);
  const price = latestPrice.value / DIVISOR;
  console.log(`Price of ${args['feed'] || DEFAULT_FEED} Is:  ${price}`);
}

console.log("Running client...");
main().then(() => console.log("Success"));
