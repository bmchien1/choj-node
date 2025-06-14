import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Course } from "./Course";
import { User } from "./User";

@Entity()
export class JoinCourseRequest extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: "course_id" })
  course!: Course;

  @Column({ default: false })
  approved: boolean = false;
}