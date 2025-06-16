import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import { Contest } from "./Contest";

@Entity()
export class ContestAttempt extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Contest)
  @JoinColumn({ name: "contest_id" })
  contest!: Contest;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  startTime!: Date;

  @Column({ type: "timestamp", nullable: true })
  endTime?: Date;

  @Column({ type: "timestamp", nullable: true })
  lastActiveTime?: Date;

  @Column({ type: "int", nullable: true })
  timeLeft?: number;

  @Column({ type: "json", nullable: true })
  answers?: any;

  @Column({ type: "boolean", default: false })
  isSubmitted!: boolean;
} 