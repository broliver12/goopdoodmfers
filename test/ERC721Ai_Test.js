/****************************************************************************
    Genesis Wiggle NFT Collection Tests
****************************************************************************/

const { expect } = require('chai')
const fs = require('fs')

describe('', () => {
    // Set these to the contract's name, and path relative to [basePath]
    const CONTRACT_NAME = 'ERC721A_mint'
    const CONTRACT_PATH = 'mock'
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
    Ensure tokenOfOwnerByIndex works as expected
****************************************************************************/
    describe(CONTRACT_NAME + ' - tokenOfOwnerByIndex', () => {
        it('tokenOfOwnerByIndex works as expected', async () => {
          await contract.connect(addr1).mint(addr1.getAddress(), 1)
          await contract.connect(addr2).mint(addr2.getAddress(), 1)
          await contract.connect(owner).mint(owner.getAddress(), 1)
          await contract.connect(addr1).mint(addr1.getAddress(), 1)
          await contract.connect(addr2).mint(addr2.getAddress(), 1)
          await contract.connect(owner).mint(owner.getAddress(), 1)
          await contract.connect(addr1).mint(addr1.getAddress(), 1)
          await contract.connect(addr2).mint(addr2.getAddress(), 1)
          await contract.connect(owner).mint(owner.getAddress(), 1)

          expect(await contract.tokenOfOwnerByIndex(addr1.getAddress(), 0)).to.equal(
              0,
          )
          expect(await contract.tokenOfOwnerByIndex(addr1.getAddress(), 1)).to.equal(
              3,
          )
          expect(await contract.tokenOfOwnerByIndex(addr1.getAddress(), 2)).to.equal(
              6,
          )
          expect(await contract.tokenOfOwnerByIndex(addr2.getAddress(), 0)).to.equal(
              1,
          )
          expect(await contract.tokenOfOwnerByIndex(addr2.getAddress(), 1)).to.equal(
              4,
          )
          expect(await contract.tokenOfOwnerByIndex(addr2.getAddress(), 2)).to.equal(
              7,
          )
          expect(await contract.tokenOfOwnerByIndex(addr1.getAddress(), 0)).to.equal(
              2,
          )
          expect(await contract.tokenOfOwnerByIndex(addr1.getAddress(), 1)).to.equal(
              5,
          )
          expect(await contract.tokenOfOwnerByIndex(addr1.getAddress(), 2)).to.equal(
              8,
          )
        })

        it(REVERT_TAG + 'Attempting to fetch out of owner index reverts', async () => {
          await contract.connect(addr1).mint(addr1.getAddress(), 1)
          expect(await contract.tokenOfOwnerByIndex(addr1.getAddress(), 1))
        })
    })
})
