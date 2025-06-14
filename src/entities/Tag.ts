import { Entity, Column, ManyToOne, ManyToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import { Question } from "./Question";

@Entity()
export class Tag extends BaseEntity {
  @Column()
  name!: string;

  @ManyToOne(() => User, (user) => user.tags)
  creator!: User;

  @ManyToMany(() => Question, (question) => question.tags)
  questions!: Question[];
}