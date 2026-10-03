import { pgTable, integer, jasonb, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";
import { UserTable } from "./user";
import { ProductTable } from "./product";
import { CourseTable } from "./course";

export const PurchaseTable = pgTable("purchases", {
    id,
    pricePaidInCents: integer().notNull(),
    productDetails: jasonb()
        .notNull()
        .$type<{ name: string; description: string; imageUrl: string }>(),
    userId: uuid()
        .notNull()
        .references(() => UserTable.id, { onDelete: "restrict" }),
    productId: uuid()
        .notNull()
        .references(() => ProductTable.id, { onDelete: "restrict" }),
    stripeSessionId: text().notNull().unique(),
    refundedAt: timestamp({ withTimezone: true }),
    createdAt,
    updatedAt,
})

export const PurchaseRelationships = relations(PurchaseTable, 
    ({ one }) => ({
        user: one(UserTable, {
            fields: [PurchaseTable.userId],
            references:[UserTable.id],
        }),
        course: one(CourseTable, {
            fields: [PurchaseTable.productId],
            references: [CourseTable.id],
        })
    })
)

// productDetails is for memorizing the product's details the moment a user bought it. So it is
//  when a user bought that course or product at 20 dollars and then in the future i change the price.