
comment on TABLE "public"."pending_token_gifts" is E'GIVE allocations made by circle members for the currently running epoch';

comment on TABLE "public"."token_gifts" is E'GIVE allocations made by circle members for completed epochs';

comment on TABLE "public"."users" is E'Members of a circle';

comment on TABLE "public"."profiles" is E'Orcanize user accounts that can belong to one or many circles via the relationship to the users table';
