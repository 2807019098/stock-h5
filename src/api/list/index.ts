import request from '@/utils/request'

//#region 股价每日预测列表
/**
 * 股价每日预测列表
 */
export function GetStockList(params: Recordable) {
  return request({
    url: '/api/StockList/GetStockList',
    method: 'POST',
    data: params
  })
}
//#endregion

//#region 我的股票列表
/**
 * 我的股票列表
 */
export function GetMyStockList(params: Recordable) {
  return request({
    url: '/api/StockList/GetMyStockList',
    method: 'POST',
    data: params
  })
}
//#endregion

//#region 加自选
/**
 * 加自选
 */
export function AddStock(params: Recordable) {
  return request({
    url: '/api/StockList/AddStock',
    method: 'POST',
    data: params
  })
}
//#endregion

//#region 删除加自选
/**
 * 删除加自选
 */
export function DeleteStock(params: Recordable) {
  return request({
    url: '/api/StockList/DeleteStock',
    method: 'POST',
    data: params
  })
}
//#endregion
