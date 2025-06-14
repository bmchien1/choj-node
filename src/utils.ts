import { SubmissionStatus } from "./types";

export function base64Decode(str: string): string {
  return Buffer.from(str, "base64").toString("ascii");
}

export function getSubmissionStatus(statusId: number): SubmissionStatus {
  switch (statusId) {
    case 3:
      return SubmissionStatus.ACCEPTED;
    case 4:
      return SubmissionStatus.REJECTED;
    case 6:
      return SubmissionStatus.ERROR;
    default:
      return SubmissionStatus.PENDING;
  }
}

export function toPageDTO<T>([data, total]: [T, number], page: number, limit: number) {
  return {
    contents: data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}