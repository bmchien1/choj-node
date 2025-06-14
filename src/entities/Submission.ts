import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Assignment } from "./Assignment";
import { User } from "./User";
import { Question } from "./Question";
import { Contest } from "./Contest";
import { Course } from "./Course";

@Entity()
export class Submission extends BaseEntity {
  @ManyToOne(() => Assignment)
  @JoinColumn({ name: "assignment_id" })
  assignment?: Assignment;

  @ManyToOne(() => Contest)
  @JoinColumn({ name: "contest_id" })
  contest?: Contest;

  @ManyToOne(() => Course)
  @JoinColumn({ name: "course_id" })
  course?: Course;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "json" })
  answers!: any;

  @Column()
  score!: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  submitted_at!: Date;

  @Column({ type: "json", nullable: true })
  results?: any;
}