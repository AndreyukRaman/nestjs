import { BeforeInsert, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import {hash} from 'bcrypt';
import { ArticleEntity } from '@app/article/article.entity';
import { CommentEntity } from '@app/comment/comment.entity';

@Entity({name: 'users'})
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column({default: ''})
  bio: string;

  @Column({default: 10})
  points: number;

  @Column({default: ''})
  image: string;

  @Column({select:false})
  password: string;

  @BeforeInsert()
  async hashPassword(){
this.password = await hash(this.password, 10);
  }

  @OneToMany( ()=> ArticleEntity, (article) => article.author)
  articles: ArticleEntity[];

  @OneToMany(()=> CommentEntity, comment => comment.author)
  comments: CommentEntity[];

  @ManyToMany( ()=> ArticleEntity)
  @JoinTable()
  favorites: ArticleEntity[];
}