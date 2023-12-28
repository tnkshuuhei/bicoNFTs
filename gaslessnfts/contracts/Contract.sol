// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasedBicoNFT is ERC721 {
    constructor() ERC721("Based Biconomy SDK NFT", "BBNFT") {}

    uint256 public tokenId = 0;

    function safeMint(address to) public {
        _safeMint(to, tokenId);
        tokenId++;
    }
}
