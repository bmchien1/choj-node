import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import { Chapter } from "./Chapter";

@Entity()
export class Course extends BaseEntity {
  @ManyToOne(() => User, (user) => user.courses)
  creator!: User;

  @Column()
  name!: string;

  @Column({ type: "text" })
  description!: string;

  @Column()
  class!: string;

  @Column({ default: "Toán" })
  subject!: string;

  @OneToMany(() => Chapter, (chapter) => chapter.course, { cascade: true, onDelete: "CASCADE" })
  chapters!: Chapter[];
}