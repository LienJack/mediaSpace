import request from './base';
import { InlineResponse200Data } from '@/gen/models/inline-response200-data';

export const getCommentListReq = (id: string): Promise<InlineResponse200Data> => {
    return request.get(`/api/v1/comment/getLists/${id}`);
}
