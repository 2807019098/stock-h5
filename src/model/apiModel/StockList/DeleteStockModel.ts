/**
 * 删除加自选
 */

interface DeleteStockRequestModel {
  stockCode: string // 股票代码
}

interface DeleteStockResponseModel {
  isdel: string // 是否取消加自选
}

export type { DeleteStockRequestModel, DeleteStockResponseModel }
