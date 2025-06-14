import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Course } from "./Course";
import { Lesson } from "./Lesson";
import { Assignment } from "./Assignment";

@Entity()
export class Chapter extends BaseEntity {
  @ManyToOne(() => Course)
  @JoinColumn({ name: "course_id" })
  course!: Course;

  @Column()
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column()
  order!: number;

  @OneToMany(() => Lesson, (lesson) => lesson.chapter)
  lessons!: Lesson[];

  @OneToMany(() => Assignment, (assignment) => assignment.chapter)
  assignments!: Assignment[];
} 