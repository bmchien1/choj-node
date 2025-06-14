import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import { Assignment } from "./Assignment";

@Entity()
export class AssignmentSubmission extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Assignment)
  @JoinColumn({ name: "assignment_id" })
  assignment!: Assignment;

  @Column({ type: "json" })
  answer!: any;

  @Column({ type: "double precision" })
  points?: number;
}