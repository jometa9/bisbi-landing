
DROP TABLE IF EXISTS "affiliatePayoutRequests" CASCADE;

DROP TABLE IF EXISTS "affiliateCommissions" CASCADE;

DROP TABLE IF EXISTS "affiliateReferrals" CASCADE;

DROP TABLE IF EXISTS "affiliates" CASCADE;

ALTER TABLE "user" DROP COLUMN IF EXISTS "affiliateId";
ALTER TABLE "user" DROP COLUMN IF EXISTS "affiliate_id";
ALTER TABLE "user" DROP COLUMN IF EXISTS "referredBy";
ALTER TABLE "user" DROP COLUMN IF EXISTS "referred_by";
ALTER TABLE "user" DROP COLUMN IF EXISTS "referralCode";
ALTER TABLE "user" DROP COLUMN IF EXISTS "referral_code";
ALTER TABLE "user" DROP COLUMN IF EXISTS "affiliateCode";
ALTER TABLE "user" DROP COLUMN IF EXISTS "affiliate_code";

DROP TABLE IF EXISTS "discountCodes" CASCADE;
DROP TABLE IF EXISTS "discount_codes" CASCADE;
DROP TABLE IF EXISTS "promoCodes" CASCADE;
DROP TABLE IF EXISTS "promo_codes" CASCADE;
DROP TABLE IF EXISTS "coupons" CASCADE;

ALTER TABLE "user" DROP COLUMN IF EXISTS "discountCode";
ALTER TABLE "user" DROP COLUMN IF EXISTS "discount_code";
ALTER TABLE "user" DROP COLUMN IF EXISTS "promoCode";
ALTER TABLE "user" DROP COLUMN IF EXISTS "promo_code";
ALTER TABLE "user" DROP COLUMN IF EXISTS "couponCode";
ALTER TABLE "user" DROP COLUMN IF EXISTS "coupon_code";

ALTER TABLE "userProductSubscription" DROP COLUMN IF EXISTS "discountCode";
ALTER TABLE "userProductSubscription" DROP COLUMN IF EXISTS "discount_code";
ALTER TABLE "userProductSubscription" DROP COLUMN IF EXISTS "promoCode";
ALTER TABLE "userProductSubscription" DROP COLUMN IF EXISTS "promo_code";
ALTER TABLE "userProductSubscription" DROP COLUMN IF EXISTS "affiliateId";
ALTER TABLE "userProductSubscription" DROP COLUMN IF EXISTS "affiliate_id";

