import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMarketEntity1774431698000 implements MigrationInterface {
  name = 'CreateMarketEntity1774431698000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "markets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "on_chain_market_id" character varying NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "category" character varying NOT NULL, "outcome_options" text NOT NULL, "end_time" TIMESTAMP WITH TIME ZONE NOT NULL, "resolution_time" TIMESTAMP WITH TIME ZONE NOT NULL, "is_resolved" boolean NOT NULL DEFAULT false, "resolved_outcome" character varying, "is_public" boolean NOT NULL DEFAULT true, "is_cancelled" boolean NOT NULL DEFAULT false, "total_pool_stroops" bigint NOT NULL DEFAULT '0', "participant_count" integer NOT NULL DEFAULT 0, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "creatorId" uuid, CONSTRAINT "UQ_on_chain_market_id" UNIQUE ("on_chain_market_id"), CONSTRAINT "PK_markets_id" PRIMARY KEY ("id"), CONSTRAINT "FK_markets_creator" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_on_chain_market_id" ON "markets" ("on_chain_market_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_creator" ON "markets" ("creatorId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_category" ON "markets" ("category")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_is_resolved" ON "markets" ("is_resolved")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_is_resolved"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_category"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_creator"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_on_chain_market_id"`);
    await queryRunner.query(`DROP TABLE "markets"`);
  }
}
