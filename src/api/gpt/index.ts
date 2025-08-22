import request from '@/utils/request/http';

export function GetGptText(params: Recordable) {
  return request({
    url: '/api/Gpt/GetGptText',
    method: 'POST',
    data: params
  });
}
