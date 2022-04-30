# GOOPDOODMFERS

Solidity code for goopdoodmfers NFT collection.
8008 goopdoodmfers.

NOT affiliated with, or endorsed by `goopdoods` OR `mfers`.
Fan Art, all layers hand drawn.

## View Contract on the Ethereum Mainnet

- [Etherscan](https://etherscan.io/address/0xefb6bcdad3af3b0eb6ea5d7f915736b777cce369)
- [Looksrare](https://looksrare.org/collections/0xEfB6BcDad3aF3B0eb6eA5D7F915736B777cCE369)

## Independent Audit

- Auditor: [@ovosontop](https://twitter.com/ovosontop) aka ovos.eth
- Audit Result: __SAFE__
- [Click to see full audit result & contract breakdown](https://gateway.pinata.cloud/ipfs/QmPtbsbky7GD3aaPRmqC4yxW7i6nmEgBor9wcfwzMKBNUn)

TLDR:

>_"My initial thoughts of the contract are superb, the developer has demonstrated_
>_a clear understanding and implementation of the ERC721A contract."_

## Usage

#### Setup

    // Clone repository, navigate to root directory (/goopdoodmfers)
    git clone https://github.com/broliver12/goopdoodmfers.git
    
    // Install necessary dependencies
    npm run setup
    
    // Set account private key, etherscan key, RPC URLs in ./env/secrets.json
    
    // Compile project
    npm run rebuild

#### Deploy

    npm run deploy
    // Follow deploy script prompts
    // Wait for deployment success

#### Verify

    npm run verify `networkName` `deployedContractAddress`
    // Wait for verification success

#### Testing

    npm run test
    // See test results

## Contact

Author, Owner: Oliver Straszynski

Email: oliver.strasz@gmail.com

## License

__MIT__

_Happy Hacking_
