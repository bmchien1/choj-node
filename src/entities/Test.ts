import { Entity, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import { Question } from "./Question";

@Entity()
export class Test extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  creator!: User;

  @Column()
  title!: string;

  @Column({ type: "text" })
  description!: string;
  
  @Column({ nullable: true })
  duration?: number;

  @OneToMany(() => Question, (question) => question.tests)
  questions?: Question[];

  @Column({ type: "json", nullable: true })
  questions_scores?: any;

  @Column({ nullable: true })
  total_points?: number;
}