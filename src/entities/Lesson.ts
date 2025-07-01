import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { Course } from "./Course";
import { Chapter } from "./Chapter";

export enum LessonType {
	JSON = "json",
	VIDEO = "video",
}

@Entity()
export class Lesson extends BaseEntity {
	@ManyToOne(() => Course)
	@JoinColumn({ name: "course_id" })
	course!: Course;

	@ManyToOne(() => Chapter, (chapter) => chapter.lessons, { onDelete: "CASCADE" })
	@JoinColumn({ name: "chapter_id" })
	chapter!: Chapter;

	@Column()
	title!: string;

	@Column({ type: "text" })
	description!: string;

	@Column({ nullable: true })
	file_url?: string;

	@Column()
	order!: number;

	@Column({ type: "json", nullable: true })
	content?: any;

	@Column({ type: "varchar", default: LessonType.JSON })
	lessonType!: LessonType;

	@Column({ nullable: true })
	video_url?: string;
}