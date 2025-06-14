import { Entity, Column, ManyToOne, JoinColumn, OneToMany, ManyToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import { Assignment } from "./Assignment";
import { Lesson } from "./Lesson";
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

  @OneToMany(() => Chapter, (chapter) => chapter.course)
  chapters!: Chapter[];

  @OneToMany(() => Assignment, (assignment) => assignment.course)
  assignments!: Assignment[];

  @OneToMany(() => Lesson, (lesson) => lesson.course)
  lessons!: Lesson[];
}