/****************************************************************************
    Goopdoodmfers NFT Collection Tests
****************************************************************************/

const { expect } = require('chai')
const fs = require('fs')

describe('', () => {
    // Set these to the contract's name, and path relative to [basePath]
    const CONTRACT_NAME = 'Goopdoodmfers'
    const CONTRACT_PATH = ''
    let factory, contract, goopFactory, goopContract, owner, addr1, addr2
    let addrs
    const REVERT_TAG = 'REVERT_EXPECTED: '
    const basePath = './build/artifacts/solidity/'
    const extension = '.json'
    const fullArtifactPath = `${basePath}${CONTRACT_PATH}/${CONTRACT_NAME}.sol/${CONTRACT_NAME}.json`
    const goopArtifactPath = `${basePath}${CONTRACT_PATH}/Goopdoodmfers.sol/Goopdoodmfers.json`
    const contractFileData = fs.readFileSync(fullArtifactPath)
    const COMPILED_CONTRACT = JSON.parse(contractFileData)
    const goopContractFileData = fs.readFileSync(goopArtifactPath)
    const GOOP_COMPILED_CONTRACT = JSON.parse(goopContractFileData)

    const price = ethers.utils.parseEther('0.018')
    const price2 = ethers.utils.parseEther('0.036')
    const price20 = ethers.utils.parseEther('0.36')
    const oneEther = ethers.utils.parseEther('1')
    const modPrice = ethers.utils.parseEther('0.04')
    const mintFive = ethers.utils.parseEther('0.9')

    // const provider = ethers.providers.getDefaultProvider(4);

    beforeEach(async () => {
        ;[owner, addr1, addr2, ...addrs] = await ethers.getSigners()

        factory = await ethers.getContractFactory(
            COMPILED_CONTRACT.abi,
            COMPILED_CONTRACT.bytecode,
            owner,
        )
        goopFactory =  await ethers.getContractFactory(
            GOOP_COMPILED_CONTRACT.abi,
            GOOP_COMPILED_CONTRACT.bytecode,
            owner,
        )
        contract = await factory.deploy()
        goopContract = await goopFactory.deploy()
        await contract.deployTransaction.wait()
        await goopContract.deployTransaction.wait()
        await contract.setAllowedAddress(goopContract.address)
        await goopContract.setAllowedAddress(contract.address)
    })

/****************************************************************************
    Ensure correct conditions when deploying
****************************************************************************/
    describe(CONTRACT_NAME + ' - Deployment', () => {
        it('Should have 8000 supply', async () => {
            expect(await contract.collectionSize()).to.equal(
                8008,
            )
        })
        it('Price should be 0.01', async () => {
            expect(await contract.price()).to.equal(price)
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
    Test public mint
****************************************************************************/
    describe(CONTRACT_NAME + ' - Test Goop discount', () => {
        beforeEach(async () => {
            await contract.connect(owner).setMintState(2)
            await goopContract.connect(owner).setMintState(2)
            await goopContract.connect(addr1).publicMint(2, {
                value: price2,
            })
        })
        it('User can claim all free mints', async () => {
            expect(
                await contract.connect(addr1).publicMint(2, {
                    value: 0,
                }))
            expect(
                await contract.connect(addr1).publicMint(1, {
                    value: price,
                }))
        })
        it('User can claim some free mints', async () => {
            expect(
                await contract.connect(addr1).publicMint(1, {
                    value: 0,
                }))
        })
        it('User can mint more, and claim partial discount', async () => {
            expect(
                await contract.connect(addr1).publicMint(3, {
                    value: price,
                }))
        })
        it(REVERT_TAG + 'User cant caim more discount than they have', async () => {
            expect(
                await contract.connect(addr1).publicMint(3, {
                    value: 0,
                })).to.be.revertedWith('anything');
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
                    .devMint(addr1.getAddress(), 7),
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
                    .devMint(addr1.getAddress(), 7),
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
                    .devMint(addr1.getAddress(), 1),
            )
            expect(
                await contract
                    .connect(owner)
                    .devMint(addr1.getAddress(), 6),
            )
        })

        it('Owner can devMint to themself', async () => {
            expect(
                await contract
                    .connect(owner)
                    .devMint(owner.getAddress(), 1),
            )
        })

        it(REVERT_TAG + 'Cant devMint more than 7', async () => {

            expect(
                await contract
                    .connect(owner)
                    .devMint(addr1.getAddress(), 26),
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
                    .devMint(addr1.getAddress(), 1),
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
                        .setExt(''),
                )
            },
        )

        it(
            REVERT_TAG + 'Non owner cant change base URI',
            async () => {
                expect(await contract.connect(addr1).setBaseURI(''))
            },
        )

        it(
            REVERT_TAG + 'Non owner cant change base URI',
            async () => {
                expect(await contract.connect(addr1).setAllowedAddress(addr1.getAddress()))
            },
        )

        it(REVERT_TAG + 'Non owner cant reveal art', async () => {
            expect(await contract.connect(addr1).reveal(true))
        })
    })
})
