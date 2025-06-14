import { Entity, Column } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class ExerciseType extends BaseEntity {
    @Column()
    name!: string;
}
