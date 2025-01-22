/**
 * 股价每日预测列表
 */

interface GetStockListRequestModel {
  pageNo: number // 起始页
  pageSize: number // 每页请求的数据量
  SortField: string // 排序类型
  SortAsc: string // 排序方式
  Keyword: string // 关键字
  ismy: string // 是否我的
  yili: string // 盈利
  dax: string // X日
  xianzhi: string // 涨跌限
}

interface GetStockListResponseModel<T1 extends StockListPage, T2 extends StockPred> {
  esdate: Date // 预测日期
  Page: T1 // 分页信息
  SList: T2[] // 列表信息
}

interface StockListPage {
  pageNo: number // 起始页
  pageSize: number // 每页请求的数据量
  TotalCount: number // 总条数
  HasMore: boolean // 是否还有更多数据
}

interface StockPred extends StockPredListView {
  stockCode: string // 股票代码
  stockName: string // 股票名称
  fronterror: string // 前误差
  endPrice: number // 现价
  day1Dif: number // 日1预测误差
  day1_2: number // 排序规则（(1日-2日)/2日）
  day2_1: number // 排序规则（(2日-1日)/1日）
  day1Price: number // 1日
  day1Rise: number // 1日涨跌幅
  day2Price: number // 2日
  day2Rise: number // 2日涨跌幅
  dayxPrice: number // X日
  dayxRise: number // X日涨跌幅
  eventPred: number // 事件涨跌
  renqiPred: number // 人气涨跌
  dynPE: number // 市盈率
  marketValue: number // 总市值
  bigXday: number // X日是否大于1日2日
  predDate: Date // 预测日期
}

interface StockPredListView {
  logic: string // 逻辑
  storeNum: number // 持仓数量
  lastPrice: number // 最后成交价(正负)
  buyPrice: number // 设置买入价格
  sellPrice: number // 设置卖出价
}

export type {
  GetStockListRequestModel,
  GetStockListResponseModel,
  StockListPage,
  StockPred,
  StockPredListView
}
