import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
// A canonical random key lets simultaneous first visits preserve the same
// earlier collection. These keys are server-only and never listed publicly.
export const legacyCollections = sqliteTable("legacy_collections", {
  legacyOwnerId: text("legacy_owner_id").primaryKey(),
  collectionToken: text("collection_token").notNull(),
});
export const photos = sqliteTable("photos", {
  id: text("id").primaryKey(), ownerId: text("owner_id").notNull(), name: text("name").notNull(),
  fileName: text("file_name").notNull(), contentType: text("content_type").notNull(), size: integer("size").notNull(),
  objectKey: text("object_key").notNull(), shareToken: text("share_token"), createdAt: text("created_at").notNull(),
}, table => [index("photos_owner").on(table.ownerId), uniqueIndex("photos_share_token").on(table.shareToken)]);
export const responses = sqliteTable("photo_responses", {
  id: text("id").primaryKey(), photoId: text("photo_id").notNull().references(() => photos.id, { onDelete: "cascade" }),
  respondentHash: text("respondent_hash").notNull(), words: text("words").notNull(),
  createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
}, table => [uniqueIndex("responses_photo_browser").on(table.photoId, table.respondentHash)]);
