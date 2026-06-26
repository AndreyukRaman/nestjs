import { CommentEntity } from '@app/comment/comment.entity';

type CommentAuthor = {
  username: string;
  bio: string;
  image: string;
  points: number;
  following: boolean;
};

export type CommentType = Omit<
  CommentEntity,
  'updateTimestamp' | 'article' | 'author'
> & { author: CommentAuthor };
