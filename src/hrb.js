import { ChainId, Token, Fetcher, Route, WETH } from "@pancakeswap/sdk"
import { JsonRpcProvider } from "@ethersproject/providers"

const provider = new JsonRpcProvider("https://bsc-dataseed1.binance.org/")
const HRB = new Token(ChainId.MAINNET, "0x8D58a9254a84275C5449589527a5DDF85FFF6d6D", 18)
const USDT = new Token(ChainId.MAINNET, "0x55d398326f99059ff775485246999027b3197955", 18)

export const getHrbPrice = async (cb) => {
  const HRBBNB = await Fetcher.fetchPairData(HRB, WETH[HRB.chainId], provider)
  const USDTBNB = await Fetcher.fetchPairData(USDT, WETH[HRB.chainId], provider)

  const route1 = new Route([HRBBNB], WETH[HRB.chainId])
  const route2 = new Route([USDTBNB], WETH[HRB.chainId])

  const HrbBnbPrice = route1.midPrice.invert().toSignificant(6)
  const BnbUsdtPrice = route2.midPrice.toSignificant(6)

  const hrbUsdtPrice = (HrbBnbPrice * BnbUsdtPrice).toFixed(8)

  cb(hrbUsdtPrice)
}
