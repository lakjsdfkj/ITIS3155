-- ADDED: Initial SQLite DDL equivalent to ../schema.prisma.
PRAGMA foreign_keys=ON;

CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "student_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "major" TEXT,
    "concentration" TEXT,
    "bio" TEXT CHECK ("bio" IS NULL OR length("bio") <= 400),
    "photo_storage_key" TEXT,
    "resume_storage_key" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "student_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "student_profiles_user_id_key" ON "student_profiles"("user_id");

CREATE TABLE "companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "logo_url" TEXT,
    "industry" TEXT
);
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");

CREATE TABLE "interests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);
CREATE UNIQUE INDEX "interests_name_key" ON "interests"("name");

CREATE TABLE "student_profile_interests" (
    "profile_id" TEXT NOT NULL,
    "interest_id" TEXT NOT NULL,
    PRIMARY KEY ("profile_id", "interest_id"),
    CONSTRAINT "student_profile_interests_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "student_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "student_profile_interests_interest_id_fkey" FOREIGN KEY ("interest_id") REFERENCES "interests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "skills" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL CHECK ("level" IN ('Foundational', 'Intermediate', 'Advanced')),
    "estimated_hours" INTEGER NOT NULL CHECK ("estimated_hours" > 0),
    "summary" TEXT NOT NULL,
    "why" TEXT NOT NULL
);
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

CREATE TABLE "skill_topics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "skill_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL CHECK ("position" > 0),
    "title" TEXT NOT NULL,
    CONSTRAINT "skill_topics_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "skill_topics_skill_id_position_key" ON "skill_topics"("skill_id", "position");

CREATE TABLE "credentials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);
CREATE UNIQUE INDEX "credentials_name_key" ON "credentials"("name");

CREATE TABLE "skill_credentials" (
    "skill_id" TEXT NOT NULL,
    "credential_id" TEXT NOT NULL,
    PRIMARY KEY ("skill_id", "credential_id"),
    CONSTRAINT "skill_credentials_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "skill_credentials_credential_id_fkey" FOREIGN KEY ("credential_id") REFERENCES "credentials" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "student_profile_skills" (
    "profile_id" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'self_reported' CHECK ("source" IN ('self_reported', 'resume', 'assessment')),
    "proficiency_level" TEXT,
    PRIMARY KEY ("profile_id", "skill_id"),
    CONSTRAINT "student_profile_skills_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "student_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "student_profile_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL,
    "interest_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL CHECK ("type" IN ('Internship', 'Project', 'Co-op')),
    "summary" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "deadline" DATETIME,
    "posted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Open' CHECK ("status" IN ('Draft', 'Open', 'Closed')),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "opportunities_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "opportunities_interest_id_fkey" FOREIGN KEY ("interest_id") REFERENCES "interests" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "opportunities_company_id_idx" ON "opportunities"("company_id");
CREATE INDEX "opportunities_interest_id_status_idx" ON "opportunities"("interest_id", "status");

CREATE TABLE "opportunity_skills" (
    "opportunity_id" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,
    "requirement_type" TEXT NOT NULL CHECK ("requirement_type" IN ('required', 'desired')),
    PRIMARY KEY ("opportunity_id", "skill_id"),
    CONSTRAINT "opportunity_skills_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "opportunity_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "opportunity_deliverables" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opportunity_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL CHECK ("position" > 0),
    "description" TEXT NOT NULL,
    CONSTRAINT "opportunity_deliverables_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "opportunity_deliverables_opportunity_id_position_key" ON "opportunity_deliverables"("opportunity_id", "position");

CREATE TABLE "saved_opportunities" (
    "profile_id" TEXT NOT NULL,
    "opportunity_id" TEXT NOT NULL,
    "saved_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("profile_id", "opportunity_id"),
    CONSTRAINT "saved_opportunities_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "student_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "saved_opportunities_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "news_posts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL CHECK ("source" IN ('Company', 'Employee', 'Student', 'School')),
    "author_name" TEXT NOT NULL,
    "byline" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "author_user_id" TEXT,
    "company_id" TEXT,
    "posted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "callout" TEXT,
    "reactions" INTEGER NOT NULL DEFAULT 0 CHECK ("reactions" >= 0),
    "rating" INTEGER CHECK ("rating" IS NULL OR "rating" BETWEEN 1 AND 5),
    CONSTRAINT "news_posts_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "news_posts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "news_posts_posted_at_idx" ON "news_posts"("posted_at");

CREATE TABLE "news_post_interests" (
    "post_id" TEXT NOT NULL,
    "interest_id" TEXT NOT NULL,
    PRIMARY KEY ("post_id", "interest_id"),
    CONSTRAINT "news_post_interests_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "news_posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "news_post_interests_interest_id_fkey" FOREIGN KEY ("interest_id") REFERENCES "interests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "career_pathways" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "career_pathways_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "student_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "career_pathways_profile_id_idx" ON "career_pathways"("profile_id");

CREATE TABLE "pathway_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pathway_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL CHECK ("position" > 0),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'suggested' CHECK ("status" IN ('complete', 'in_progress', 'suggested', 'goal', 'alternate')),
    "estimated_hours" INTEGER CHECK ("estimated_hours" IS NULL OR "estimated_hours" > 0),
    "skill_id" TEXT,
    "credential_id" TEXT,
    CONSTRAINT "pathway_steps_pathway_id_fkey" FOREIGN KEY ("pathway_id") REFERENCES "career_pathways" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pathway_steps_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "pathway_steps_credential_id_fkey" FOREIGN KEY ("credential_id") REFERENCES "credentials" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CHECK ("skill_id" IS NOT NULL OR "credential_id" IS NOT NULL)
);
CREATE UNIQUE INDEX "pathway_steps_pathway_id_position_key" ON "pathway_steps"("pathway_id", "position");

CREATE TABLE "pathway_resources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "step_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL CHECK ("position" > 0),
    "title" TEXT NOT NULL,
    CONSTRAINT "pathway_resources_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "pathway_steps" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "pathway_resources_step_id_position_key" ON "pathway_resources"("step_id", "position");
