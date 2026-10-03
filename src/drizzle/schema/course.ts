import { pgTable, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { id, createdAt, updatedAt } from "../schemaHelpers";
import { CourseProductTable } from "./courseProduct";
import { UserCourseAccessTable } from "./userCourseAccess";
import { LessonTable } from "./lesson";

export const CourseTable = pgTable("courses", {
    id,
    name: text().notNull(),
    description: text().notNull(),
    createdAt,
    updatedAt,
})

export const CourseRelationships = relations(CourseTable,
    ({  many }) => ({
    courseProducts: many(CourseProductTable),
    userCourseAccess: many(UserCourseAccessTable),
    lessons: many(LessonTable),
}))