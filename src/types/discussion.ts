
export interface DiscussionEntry {
  id: string;
  articleId: string;
  message: string;
  username: string;
  timestamp: number;
  replies: CommentReply[];
}

export interface CommentReply {
  id: string;
  articleId: string;
  message: string;
  username: string;
  timestamp: number;
}