import { logger } from '@/runtime/logger';
import { axiosForBackend } from '@/runtime/http';

export * as forumTaskApi from './forum-task';
export * as forumDecisionApi from './forum-decision';
export * as forumNoticeApi from './forum-notice';


// Add more API functions here, use axios instance (`axiosForBackend`) to make requests.
// 
// 使用示例：
// export async function getUserData(userId: string) {
//   try {
//     const response = await axiosForBackend({
//       url: `/api/users/${userId}`,
//       method: 'GET'
//     });
//     return response.data;
//   } catch (error) {
//     logger.error('获取用户数据失败', error);
//     throw error;
//   }
// }
