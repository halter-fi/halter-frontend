export const POOLS = {
  Pagination: {
    PerPage: 10
  },
  DelegateOwner: '0xba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1ba1b',
  ZeroAddress: '0x0000000000000000000000000000000000000000',
  DynamicFees: {
    Gauntlet: ['']
  },
  BlockList: [''],
  Stable: {
    AllowList: [
      '0x381208f9eea63bf82338bb5146b46af3788b8492000200000000000000000001',
      '0x054cd708b7ab4a3116985a663ecb554b3c22f7ba000200000000000000000000',
      '6a0e9f8dd901d5f0d1f2a838fc2579c54eaab3e3000200000000000000000002'
    ]
  },
  Investment: {
    AllowList: [
      '0x054cd708b7ab4a3116985a663ecb554b3c22f7ba000200000000000000000000',
      '0x381208f9eea63bf82338bb5146b46af3788b8492000200000000000000000001',
      '0x6a0e9f8dd901d5f0d1f2a838fc2579c54eaab3e3000200000000000000000002'
    ]
  },
  Factories: {
    '0xd2ac85b65b98a00a65b91458ce2d933cd0ab275d': 'weightedPool',
    '0x82df73add5e8d42b40505b9364dade65160264fb': 'stablePool',
    '0x6fed5bd0883882f82f9e5b12714926574e58eb7c': 'investmentPool',
    '0x2daa9bdb9942d7b598516e1b87323f735ce59884': 'liquidityBootstrappingPool'
  }
};
