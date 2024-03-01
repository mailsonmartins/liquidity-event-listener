const {Web3} = require('web3');
const ethers = require('ethers');
require("dotenv").config();

// Configuração do Web3 para a Binance Smart Chain
const web3BSC = new Web3(new Web3.providers.HttpProvider(process.env.BSC_RPC));

// Configuração do Ether.js para a Ethereum
const providerEthereum = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC);

// Endereço do contrato do PancakeSwap na BSC
const pancakeSwapContractAddress = '0x10ED43C718714eb63d5aA57B78B54704E256024E';
// Endereço do contrato do Uniswap na Ethereum
const uniswapContractAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

// ABI dos contratos PancakeSwap e Uniswap
const pancakeSwapABI = ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'];
const uniswapABI = ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'];

// Cria uma instância do contrato PancakeSwap
const pancakeSwapContract = new web3BSC.eth.Contract(pancakeSwapABI, pancakeSwapContractAddress);
// Cria uma instância do contrato Uniswap
const uniswapContract = new ethers.Contract(uniswapContractAddress, uniswapABI, providerEthereum);

// Eventos a serem ouvidos
const eventNameBSC = 'PairCreated';
const eventNameEthereum = 'PairCreated';

// Cria os event filters para BSC e Ethereum
// const eventFilterBSC = pancakeSwapContract.events[eventNameBSC]();
// const eventFilterEthereum = uniswapContract.filters[eventNameEthereum]();

// Inicia o event listener para BSC
pancakeSwapContract.on(eventNameBSC, async event => {
    const token0Address = event.returnValues.token0;
    const token1Address = event.returnValues.token1;
    const lpAmount = event.returnValues.liquidity;

    console.log('Novo par de liquidez adicionado na PancakeSwap na BSC:');
    console.log('Token0:', token0Address);
    console.log('Token1:', token1Address);
    console.log('Quantidade de LP:', lpAmount);

    // Faça uma chamada para o contrato do token para obter o nome e o símbolo
    const token0Contract = new web3BSC.eth.Contract(pancakeSwapABI, token0Address);
    const token1Contract = new web3BSC.eth.Contract(pancakeSwapABI, token1Address);

    const [token0Name, token1Name, token0Symbol, token1Symbol] = await Promise.all([
        token0Contract.methods.name().call(),
        token1Contract.methods.name().call(),
        token0Contract.methods.symbol().call(),
        token1Contract.methods.symbol().call()
    ]);

    console.log('Token0 Name:', token0Name, ' Symbol:', token0Symbol);
    console.log('Token1 Name:', token1Name, ' Symbol:', token1Symbol);
});

// Inicia o event listener para Ethereum
uniswapContract.on(eventNameEthereum, async (token0, token1, lpAmount, event) => {
    console.log('Novo par de liquidez adicionado no Uniswap na Ethereum:');
    console.log('Token0:', token0);
    console.log('Token1:', token1);
    console.log('Quantidade de LP:', lpAmount.toString());

    // Faça uma chamada para o contrato do token para obter o nome e o símbolo
    const token0Contract = new ethers.Contract(token0, pancakeSwapABI, providerEthereum);
    const token1Contract = new ethers.Contract(token1, pancakeSwapABI, providerEthereum);

    const [token0Name, token1Name, token0Symbol, token1Symbol] = await Promise.all([
        token0Contract.name(),
        token1Contract.name(),
        token0Contract.symbol(),
        token1Contract.symbol()
    ]);

    console.log('Token0 Name:', token0Name, ' Symbol:', token0Symbol);
    console.log('Token1 Name:', token1Name, ' Symbol:', token1Symbol);
});
