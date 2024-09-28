alter table "public"."personal_access_tokens"
  add constraint "personal_access_tokens_tokenable_id_fkey"
  foreign key ("tokenable_id")
  references "public"."profiles"
  ("id") on update restrict on delete restrict;
