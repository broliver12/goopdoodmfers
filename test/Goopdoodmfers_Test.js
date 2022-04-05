/****************************************************************************
    Goopdoodmfers NFT Collection Tests
****************************************************************************/

const { expect } = require('chai')
const fs = require('fs')

describe('', () => {
    // Set these to the contract's name, and path relative to [basePath]
    const CONTRACT_NAME = 'Goopdoodmfers'
    const CONTRACT_PATH = ''
    let factory, contract, owner, addr1, addr2
    let addrs
    const REVERT_TAG = 'REVERT_EXPECTED: '
    const basePath = './build/artifacts/solidity/'
    const extension = '.json'
    const fullArtifactPath = `${basePath}${CONTRACT_PATH}/${CONTRACT_NAME}.sol/${CONTRACT_NAME}.json`
    const contractFileData = fs.readFileSync(fullArtifactPath)
    const COMPILED_CONTRACT = JSON.parse(contractFileData)

    const price = ethers.utils.parseEther('0.01')
    const price20 = ethers.utils.parseEther('0.2')
    const oneEther = ethers.utils.parseEther('1')
    const modPrice = ethers.utils.parseEther('0.04')
    const mintFive = ethers.utils.parseEther('0.05')

    beforeEach(async () => {
        ;[owner, addr1, addr2, ...addrs] = await ethers.getSigners()
        factory = await ethers.getContractFactory(
            COMPILED_CONTRACT.abi,
            COMPILED_CONTRACT.bytecode,
            owner,
        )
        contract = await factory.deploy()
        await contract.deployTransaction.wait()
    })

/****************************************************************************
    Ensure correct conditions when deploying
****************************************************************************/
    describe(CONTRACT_NAME + ' - Deployment', () => {
        it('Should have 8000 supply', async () => {
            expect(await contract.totalCollectionSize()).to.equal(
                8000,
            )
        })
        it('Price should be 0.01', async () => {
            expect(await contract.unitPrice()).to.equal(price)
        })
        it(REVERT_TAG + 'Mint should be disabled', async () => {
            expect(
                await contract.connect(addr1).publicMint(1, {
                    value: price,
                }),
            ).to.be.revertedWith('Minting not enabled.')
        })
        it(
            REVERT_TAG + 'WhitelistMint should be disabled',
            async () => {
                expect(
                    await contract
                        .connect(addr1)
                        .whitelistMint(1, {
                            value: price,
                        }),
                ).to.be.revertedWith('Minting not enabled.')
            },
        )
    })

/****************************************************************************
    Make sure the right metadata will always be displayed and that control
    functions work
****************************************************************************/
    describe(CONTRACT_NAME + ' - Metadata', () => {
        const nrUri =
            'https://www.pinata.com/B76H376hGF36l3u88lsdja09N/notRevealed'
        const baseUri =
            'https://www.pinata.com/B76H376hGF36l3u88lsdja09N/base'
        const customUri =
            'https://www.pinata.com/B76H376hGF36l3u88lsdja09N/custom'
        const baseExt = '.json'

        beforeEach(async () => {
            await contract.connect(owner).setMintState(2)
            await contract.connect(addr1).publicMint(1, {
                value: price,
            })
        })

        it('notRevealedURI should be empty', async () => {
            expect(await contract.tokenURI(0)).to.equal('')
        })
        it('notRevealedURI displayed before reveal', async () => {
            await contract.connect(owner).setNotRevealedURI(nrUri)
            await contract.connect(owner).setBaseURI(baseUri)
            expect(await contract.tokenURI(0)).to.equal(nrUri)
        })
        it('baseUri + baseExt displayed after reveal', async () => {
            await contract.connect(owner).reveal(true)
            await contract.connect(owner).setNotRevealedURI(nrUri)
            await contract.connect(owner).setBaseURI(baseUri)
            expect(await contract.tokenURI(0)).to.equal(
                baseUri + '0' + baseExt,
            )
        })
    })

/****************************************************************************
    Test public mint
****************************************************************************/
    describe(CONTRACT_NAME + ' - Public Mint', () => {
        beforeEach(async () => {
            await contract.connect(owner).setMintState(2)
        })
        it('All mint options valid', async () => {
            expect(
                await contract.connect(addr1).publicMint(1, {
                    value: price,
                }),
            )
            expect(
                await contract.connect(addr1).publicMint(19, {
                    value: price20,
                }),
            )
        })

        it(REVERT_TAG + 'Invalid mint option', async () => {
            expect(
                await contract.connect(addr1).publicMint(22, {
                    value: oneEther,
                }),
            ).to.be.revertedWith('Invalid mint option.')
        })
    })

/****************************************************************************
    Test changing mint state
****************************************************************************/
    describe(CONTRACT_NAME + ' - Mint Control', () => {
        it(REVERT_TAG + 'Mint reverts after disable', async () => {
            await contract.connect(owner).setMintState(2)
            await contract.connect(owner).setMintState(0)
            expect(
                await contract.connect(addr1).publicMint(5, {
                    value: price20,
                }),
            ).to.be.revertedWith('Minting not enabled')
        })

        it('Dev mint works after disable', async () => {
            await contract.connect(owner).setMintState(2)
            await contract.connect(owner).setMintState(0)
            expect(
                await contract
                    .connect(owner)
                    .devMint(7, addr1.getAddress()),
            )
        })

        it(REVERT_TAG + 'Mint reverts after disable', async () => {
            await contract.connect(owner).setMintState(2)
            await contract.connect(owner).setMintState(0)
            expect(
                await contract.connect(addr1).publicMint(5, {
                    value: price20,
                }),
            ).to.be.revertedWith('Minting not enabled')
        })

        it('Dev mint works after disable', async () => {
            await contract.connect(owner).setMintState(2)
            await contract.connect(owner).setMintState(0)
            expect(
                await contract
                    .connect(owner)
                    .devMint(7, addr1.getAddress()),
            )
        })
    })

/****************************************************************************
    Test developer mint
****************************************************************************/
    describe(CONTRACT_NAME + ' - Dev mint', () => {
        it('All mint options valid', async () => {
            expect(
                await contract
                    .connect(owner)
                    .devMint(1, addr1.getAddress()),
            )
            expect(
                await contract
                    .connect(owner)
                    .devMint(6, addr1.getAddress()),
            )
        })

        it('Owner can devMint to themself', async () => {
            expect(
                await contract
                    .connect(owner)
                    .devMint(1, owner.getAddress()),
            )
        })

        it(REVERT_TAG + 'Cant devMint more than 7', async () => {
            expect(
                await contract
                    .connect(owner)
                    .devMint(8, addr1.getAddress()),
            ).to.be.revertedWith('Invalid mint option.')
        })
    })

/****************************************************************************
    Test withdraw
****************************************************************************/
    describe(CONTRACT_NAME + ' - Withdraw', () => {
        it('Owner can withdraw 0', async () => {
            expect(await contract.connect(owner).withdraw())
        })
        it('Owner can withdraw non-0 amount', async () => {
            await contract.connect(owner).setMintState(2)
            await contract.connect(addr1).publicMint(20, {
                value: price20,
            })
            expect(await contract.connect(owner).withdraw())
        })
    })

/****************************************************************************
    Ensure all owner functions are inaccessible to non-owner
****************************************************************************/
    describe(CONTRACT_NAME + ' - Non-owner', () => {
        it(REVERT_TAG + 'Non owner cant withdraw', async () => {
            expect(await contract.connect(addr1).withdraw())
        })
        it(REVERT_TAG + 'Non owner cant freeMint', async () => {
            expect(
                await contract
                    .connect(addr1)
                    .devMint(1, addr1.getAddress()),
            )
        })
        it(
            REVERT_TAG + 'Non owner cant change mint state',
            async () => {
                expect(await contract.connect(addr1).setMintState(2))
            },
        )
        it(
            REVERT_TAG + 'Non owner cant change not revealed URI',
            async () => {
                expect(
                    await contract
                        .connect(addr1)
                        .setNotRevealedURI(''),
                )
            },
        )

        it(
            REVERT_TAG + 'Non owner cant change base extension',
            async () => {
                expect(
                    await contract
                        .connect(addr1)
                        .setBaseExtension(''),
                )
            },
        )

        it(
            REVERT_TAG + 'Non owner cant change base URI',
            async () => {
                expect(await contract.connect(addr1).setBaseURI(''))
            },
        )

        it(REVERT_TAG + 'Non owner cant reveal art', async () => {
            expect(await contract.connect(addr1).reveal(true))
        })
    })
})
