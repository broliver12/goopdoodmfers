// SPDX-License-Identifier: MIT

/****************************************************************************
    Basic extension of ERC721A_indexExt to allow testing.
    
    Written by Oliver Straszynski
    https://github.com/broliver12/
****************************************************************************/

pragma solidity ^0.8.4;

import "./../ERC721A_indexExt.sol";

contract ERC721A_mint is ERC721A_indexExt {
    constructor() ERC721A_indexExt("", "") {}
    function mint(address recipient, uint256 quantity) external {
        _safeMint(recipient, quantity);
    }
}
