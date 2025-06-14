import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import { Test } from "./Test";

@Entity()
export class TestSubmission extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Test)
  @JoinColumn({ name: "test_id" })
  test!: Test;

  @Column({ type: "json" })
  answer!: any;

  @Column({ type: "double precision" })
  points?: number;
}