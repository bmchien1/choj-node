import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { Assignment } from "./Assignment";
import { Test } from "./Test";
import { BaseEntity } from "./BaseEntity";
import { User } from "./User";
import { Tag } from "./Tag";
import { Contest } from "./Contest";

@Entity()
export class Question extends BaseEntity {
  @Column()
  questionName!: string;

  @Column()
  questionType!: string;

  @Column()
  question!: string;

  @Column()
  difficulty_level!: string;

  @Column({ nullable: true })
  question_image_url?: string;

  @ManyToOne(() => User, (user) => user.questions)
  creator!: User;

  @ManyToOne(() => Test, (test) => test.questions)
  tests?: Test;

  @ManyToOne(() => Assignment, (assignment) => assignment.questions)
  assignments?: Assignment;

  @ManyToMany(() => Tag, (tag) => tag.questions)
  @JoinTable()
  tags?: Tag[];

  @Column({ nullable: true })
  templateCode?: string;

  @Column({ nullable: true })
  cpuTimeLimit?: number;

  @Column({ nullable: true })
  memoryLimit?: number;

  @Column("json", { nullable: true })
  testCases?: { input: string; output: string }[];

  @Column({ nullable: true })
  language?: string;

  @Column({ nullable: true })
  correctAnswer?: string;

  @Column("json", { nullable: true })
  choices?: any;

  @Column({ nullable: true })
  maxPoint?: number;

  @ManyToOne(() => Contest, contest => contest.questions)
  contest?: Contest;
}