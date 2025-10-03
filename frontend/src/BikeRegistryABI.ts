export const ABI = [
  // registerBike
  {
    "inputs": [
      {"internalType":"string","name":"serial","type":"string"},
      {"internalType":"string","name":"brand","type":"string"}
    ],
    "name":"registerBike",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  // getBikeOwner
  {
    "inputs": [
      {"internalType":"string","name":"serial","type":"string"}
    ],
    "name":"getBikeOwner",
    "outputs":[
      {"internalType":"address","name":"owner","type":"address"},
      {"internalType":"string","name":"brand","type":"string"},
      {"internalType":"uint256","name":"registeredAt","type":"uint256"}
    ],
    "stateMutability":"view",
    "type":"function"
  },
  // BikeRegistered
  {
    "anonymous":false,
    "inputs":[
      {"indexed":true,"internalType":"address","name":"owner","type":"address"},
      {"indexed":false,"internalType":"string","name":"serial","type":"string"},
      {"indexed":false,"internalType":"string","name":"brand","type":"string"},
      {"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}
    ],
    "name":"BikeRegistered",
    "type":"event"
  }
];