-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('WEAPON', 'AGENT', 'SHELF', 'BACKGROUND', 'STICKER', 'CHARM');

-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'VERY_RARE', 'LEGENDARY', 'EXOTIC');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DAILY', 'LEVEL_UP', 'CASE_OPEN', 'MARKET_BUY', 'MARKET_SELL', 'SHOP_BUY', 'VOTE_REWARD', 'ADMIN_ADJUST', 'RECYCLE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGuildProfile" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "lastMessageAt" TIMESTAMP(3),
    "lastDailyAt" TIMESTAMP(3),
    "casesOpened" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGuildProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemDefinition" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,
    "rarity" "Rarity" NOT NULL,
    "collection" TEXT,
    "description" TEXT,
    "iconUrl" TEXT,
    "animatedUrl" TEXT,
    "weapon" TEXT,
    "skin" TEXT,
    "statTrak" BOOLEAN NOT NULL DEFAULT false,
    "foil" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserItem" (
    "id" SERIAL NOT NULL,
    "ownerId" TEXT NOT NULL,
    "guildId" TEXT,
    "itemDefId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "obtainedVia" TEXT,
    "inMarket" BOOLEAN NOT NULL DEFAULT false,
    "equippedSlot" INTEGER,
    "locked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseDefinition" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "collection" TEXT,
    "limited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseDropTable" (
    "id" SERIAL NOT NULL,
    "caseId" INTEGER NOT NULL,
    "rarity" "Rarity" NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CaseDropTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseDropItem" (
    "id" SERIAL NOT NULL,
    "caseId" INTEGER NOT NULL,
    "itemDefId" INTEGER NOT NULL,
    "rarity" "Rarity" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "CaseDropItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCase" (
    "id" SERIAL NOT NULL,
    "ownerId" TEXT NOT NULL,
    "guildId" TEXT,
    "caseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyDefinition" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "caseId" INTEGER,

    CONSTRAINT "KeyDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserKey" (
    "id" SERIAL NOT NULL,
    "ownerId" TEXT NOT NULL,
    "guildId" TEXT,
    "keyDefId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "guildId" TEXT,
    "type" "TransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "xpAmount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopItem" (
    "id" SERIAL NOT NULL,
    "itemDefId" INTEGER,
    "caseDefId" INTEGER,
    "keyDefId" INTEGER,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "stock" INTEGER,
    "isRotating" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketListing" (
    "id" SERIAL NOT NULL,
    "sellerId" TEXT NOT NULL,
    "guildId" TEXT,
    "userItemId" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "feePercent" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "soldAt" TIMESTAMP(3),
    "buyerId" TEXT,

    CONSTRAINT "MarketListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildConfig" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "xpPerMessageMin" INTEGER NOT NULL DEFAULT 10,
    "xpPerMessageMax" INTEGER NOT NULL DEFAULT 25,
    "xpCooldownSeconds" INTEGER NOT NULL DEFAULT 60,
    "xpMinMessageLength" INTEGER NOT NULL DEFAULT 3,
    "levelUpRewardType" TEXT NOT NULL DEFAULT 'case',
    "levelUpRewardCoins" INTEGER NOT NULL DEFAULT 50,
    "levelUpChannelId" TEXT,
    "logChannelId" TEXT,
    "marketEnabled" BOOLEAN NOT NULL DEFAULT true,
    "marketGlobal" BOOLEAN NOT NULL DEFAULT false,
    "caseOpenDailyLimit" INTEGER NOT NULL DEFAULT 10,
    "antiSpamEnabled" BOOLEAN NOT NULL DEFAULT true,
    "ignoredChannels" TEXT[],
    "xpEnabledChannels" TEXT[],
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoteLog" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'topgg',
    "voteExternalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rewardGiven" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VoteLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCosmetics" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "guildId" TEXT,
    "shelfId" INTEGER,
    "backgroundId" INTEGER,
    "shelfSlots" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCosmetics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cooldown" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "guildId" TEXT,
    "type" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cooldown_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User_banned_idx" ON "User"("banned");

-- CreateIndex
CREATE INDEX "Guild_active_idx" ON "Guild"("active");

-- CreateIndex
CREATE INDEX "UserGuildProfile_userId_idx" ON "UserGuildProfile"("userId");

-- CreateIndex
CREATE INDEX "UserGuildProfile_guildId_idx" ON "UserGuildProfile"("guildId");

-- CreateIndex
CREATE INDEX "UserGuildProfile_xp_idx" ON "UserGuildProfile"("xp");

-- CreateIndex
CREATE INDEX "UserGuildProfile_level_idx" ON "UserGuildProfile"("level");

-- CreateIndex
CREATE UNIQUE INDEX "UserGuildProfile_userId_guildId_key" ON "UserGuildProfile"("userId", "guildId");

-- CreateIndex
CREATE INDEX "ItemDefinition_type_idx" ON "ItemDefinition"("type");

-- CreateIndex
CREATE INDEX "ItemDefinition_rarity_idx" ON "ItemDefinition"("rarity");

-- CreateIndex
CREATE INDEX "ItemDefinition_collection_idx" ON "ItemDefinition"("collection");

-- CreateIndex
CREATE INDEX "UserItem_ownerId_idx" ON "UserItem"("ownerId");

-- CreateIndex
CREATE INDEX "UserItem_guildId_idx" ON "UserItem"("guildId");

-- CreateIndex
CREATE INDEX "UserItem_itemDefId_idx" ON "UserItem"("itemDefId");

-- CreateIndex
CREATE INDEX "UserItem_inMarket_idx" ON "UserItem"("inMarket");

-- CreateIndex
CREATE INDEX "CaseDefinition_limited_idx" ON "CaseDefinition"("limited");

-- CreateIndex
CREATE INDEX "CaseDropTable_caseId_idx" ON "CaseDropTable"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseDropTable_caseId_rarity_key" ON "CaseDropTable"("caseId", "rarity");

-- CreateIndex
CREATE INDEX "CaseDropItem_caseId_rarity_idx" ON "CaseDropItem"("caseId", "rarity");

-- CreateIndex
CREATE INDEX "CaseDropItem_itemDefId_idx" ON "CaseDropItem"("itemDefId");

-- CreateIndex
CREATE INDEX "UserCase_ownerId_idx" ON "UserCase"("ownerId");

-- CreateIndex
CREATE INDEX "UserCase_guildId_idx" ON "UserCase"("guildId");

-- CreateIndex
CREATE INDEX "UserCase_caseId_idx" ON "UserCase"("caseId");

-- CreateIndex
CREATE INDEX "KeyDefinition_caseId_idx" ON "KeyDefinition"("caseId");

-- CreateIndex
CREATE INDEX "UserKey_ownerId_idx" ON "UserKey"("ownerId");

-- CreateIndex
CREATE INDEX "UserKey_guildId_idx" ON "UserKey"("guildId");

-- CreateIndex
CREATE INDEX "UserKey_keyDefId_idx" ON "UserKey"("keyDefId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_guildId_idx" ON "Transaction"("guildId");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "ShopItem_isRotating_idx" ON "ShopItem"("isRotating");

-- CreateIndex
CREATE INDEX "ShopItem_endDate_idx" ON "ShopItem"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "MarketListing_userItemId_key" ON "MarketListing"("userItemId");

-- CreateIndex
CREATE INDEX "MarketListing_sellerId_idx" ON "MarketListing"("sellerId");

-- CreateIndex
CREATE INDEX "MarketListing_buyerId_idx" ON "MarketListing"("buyerId");

-- CreateIndex
CREATE INDEX "MarketListing_guildId_idx" ON "MarketListing"("guildId");

-- CreateIndex
CREATE INDEX "MarketListing_isActive_idx" ON "MarketListing"("isActive");

-- CreateIndex
CREATE INDEX "MarketListing_price_idx" ON "MarketListing"("price");

-- CreateIndex
CREATE INDEX "MarketListing_createdAt_idx" ON "MarketListing"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GuildConfig_guildId_key" ON "GuildConfig"("guildId");

-- CreateIndex
CREATE INDEX "GuildConfig_guildId_idx" ON "GuildConfig"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "VoteLog_voteExternalId_key" ON "VoteLog"("voteExternalId");

-- CreateIndex
CREATE INDEX "VoteLog_userId_idx" ON "VoteLog"("userId");

-- CreateIndex
CREATE INDEX "VoteLog_createdAt_idx" ON "VoteLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserCosmetics_userId_key" ON "UserCosmetics"("userId");

-- CreateIndex
CREATE INDEX "UserCosmetics_userId_idx" ON "UserCosmetics"("userId");

-- CreateIndex
CREATE INDEX "UserCosmetics_guildId_idx" ON "UserCosmetics"("guildId");

-- CreateIndex
CREATE INDEX "Cooldown_expiresAt_idx" ON "Cooldown"("expiresAt");

-- CreateIndex
CREATE INDEX "Cooldown_userId_type_idx" ON "Cooldown"("userId", "type");

-- AddForeignKey
ALTER TABLE "UserGuildProfile" ADD CONSTRAINT "UserGuildProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGuildProfile" ADD CONSTRAINT "UserGuildProfile_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserItem" ADD CONSTRAINT "UserItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserItem" ADD CONSTRAINT "UserItem_itemDefId_fkey" FOREIGN KEY ("itemDefId") REFERENCES "ItemDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseDropTable" ADD CONSTRAINT "CaseDropTable_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CaseDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseDropItem" ADD CONSTRAINT "CaseDropItem_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CaseDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseDropItem" ADD CONSTRAINT "CaseDropItem_itemDefId_fkey" FOREIGN KEY ("itemDefId") REFERENCES "ItemDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCase" ADD CONSTRAINT "UserCase_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCase" ADD CONSTRAINT "UserCase_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CaseDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyDefinition" ADD CONSTRAINT "KeyDefinition_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CaseDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserKey" ADD CONSTRAINT "UserKey_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserKey" ADD CONSTRAINT "UserKey_keyDefId_fkey" FOREIGN KEY ("keyDefId") REFERENCES "KeyDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopItem" ADD CONSTRAINT "ShopItem_itemDefId_fkey" FOREIGN KEY ("itemDefId") REFERENCES "ItemDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketListing" ADD CONSTRAINT "MarketListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketListing" ADD CONSTRAINT "MarketListing_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketListing" ADD CONSTRAINT "MarketListing_userItemId_fkey" FOREIGN KEY ("userItemId") REFERENCES "UserItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildConfig" ADD CONSTRAINT "GuildConfig_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoteLog" ADD CONSTRAINT "VoteLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
