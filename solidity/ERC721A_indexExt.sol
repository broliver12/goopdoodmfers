// SPDX-License-Identifier: MIT

/**************************************************************************
    - Extend ERC721A
    - Re-add tokenOfOwnerByIndex()
    - Re-add necessary errors.

    Add ability to index the collection and find all NFT owned
    by a given wallet.

    Although read only, this implementation is by nature NOT efficient,
    and degrades with collection size. Typically, you shouldn't call
    tokenOfOwnerByIndex() from another contract.

    Written by Oliver Straszynski:
    https://github.com/broliver12/
**************************************************************************/

pragma solidity ^0.8.4;

import "erc721a/contracts/ERC721A.sol";

error OwnerIndexOutOfBounds();

/**
 * @dev Extension of [ERC721A] by Chiru Labs.
 **/
contract ERC721A_indexExt is ERC721A {
    constructor(string memory name_, string memory symbol_)
        ERC721A(name_, symbol_)
    {}

    /**
     * @dev See {IERC721Enumerable-tokenOfOwnerByIndex}.
     * This read function is O(totalSupply).
     * If calling from a separate contract, be sure to test gas first.
     * It may also degrade with extremely large collection sizes,
     * (e.g >> 10000), test for your use case.
     */
    function tokenOfOwnerByIndex(address owner, uint256 index)
        public
        view
        returns (uint256)
    {
        if (index >= balanceOf(owner)) revert OwnerIndexOutOfBounds();
        uint256 numMintedSoFar = _currentIndex;
        uint256 tokenIdsIdx;
        address currOwnershipAddr;

        // Counter overflow is impossible as the loop breaks when
        // uint256 i is equal to another uint256 numMintedSoFar.
        unchecked {
            for (uint256 i; i < numMintedSoFar; i++) {
                TokenOwnership memory ownership = _ownerships[i];
                if (ownership.burned) {
                    continue;
                }
                if (ownership.addr != address(0)) {
                    currOwnershipAddr = ownership.addr;
                }
                if (currOwnershipAddr == owner) {
                    if (tokenIdsIdx == index) {
                        return i;
                    }
                    tokenIdsIdx++;
                }
            }
        }

        // Execution should never reach this point.
        revert();
    }
}
