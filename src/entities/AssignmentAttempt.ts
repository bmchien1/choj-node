import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import { Assignment } from "./Assignment";

@Entity()
export class AssignmentAttempt extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Assignment)
  @JoinColumn({ name: "assignment_id" })
  assignment!: Assignment;

  @Column({ type: "timestamp" })
  startTime!: Date;

  @Column({ type: "timestamp", nullable: true })
  lastActiveTime?: Date;

  @Column({ type: "boolean", default: false })
  isSubmitted!: boolean;

  @Column({ type: "integer" })
  timeLeft!: number; // Time left in seconds
} 