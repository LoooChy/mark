import ajax from '@/utills/api/ajax';
const prev = '/v1';

export const login = (data: {}, method: string) => ajax(`/ai-web/boxuser/login`, data, method);
export const dcm4cheepath = (data: {}, method: string) => ajax(`/dcm4cheepath`, data, method);
export const dicomListByStudyId = (data: {}, method: string) => ajax(`/ai-web/assistDiag/dicomListByStudyId`, data, method);
export const getToken = (data: {}, method: string) => ajax(`/ai-web/auth/getToken`, data, method);

