import { Entity, Column, ManyToOne, JoinColumn, ManyToMany, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Course } from "./Course";
import { Question } from "./Question";
import { Chapter } from "./Chapter";

@Entity()
export class Assignment extends BaseEntity {
  @ManyToOne(() => Course)
  @JoinColumn({ name: "course_id" })
  course!: Course;

  @ManyToOne(() => Chapter, (chapter) => chapter.assignments)
  @JoinColumn({ name: "chapter_id" })
  chapter!: Chapter;

  @Column()
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ nullable: true })
  duration!: number;

  @OneToMany(() => Question, (question) => question.assignments)
  questions!: Question[];

  @Column({ type: "json", nullable: true })
  questions_scores?: any;

  @Column({ nullable: true })
  total_points?: number;

  @Column()
  order!: number;
}