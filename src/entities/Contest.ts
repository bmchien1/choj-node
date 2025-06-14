import { Entity, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Question } from "./Question";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class Contest extends BaseEntity {
  
    @Column()
    title!: string;

    @Column("text")
    description!: string;

    @Column()
    isPublic!: boolean;

    @Column({ nullable: true })
    accessUrl!: string;

    @Column()
    startTime!: Date;

    @Column()
    endTime!: Date;

    @Column()
    duration!: number; // duration in minutes

    @ManyToOne(() => User, user => user.contests)
    creator!: User;

    @OneToMany(() => Question, question => question.contest)
    questions?:Question[];

    @Column({ type: "json", nullable: true })
    questions_scores?: any;

} 