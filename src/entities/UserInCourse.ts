import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Course } from "./Course";
import { User } from "./User";

@Entity()
export class UserInCourse extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: "course_id" })
  course!: Course;

  @Column("json", { default: () => "'[]'" })
  lessonProgress!: Record<string, boolean>[];

  @Column("json", { default: () => "'[]'" })
  assignmentProgress!: Record<string, number>[];
}