/**
 * 加自选
 */

interface AddStockRequestModel {
  stockCode: string // 股票代码
  logic: string // 逻辑
  storeNum: number // 持仓数量
  lastPrice: number // 最后成交价(正负)
  buyPrice: number // 设置买入价格
  sellPrice: number // 设置卖出价
}

interface AddStockResponseModel {
  isadd: number // 是否加自选
}

export type { AddStockRequestModel, AddStockResponseModel }
