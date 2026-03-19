import database from '../config/database';

export interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  plan_name: string;
  plan_slug: string;
  started_at: string;
  expires_at: string;
  is_active: boolean;
}

export class SubscriptionModel {
  static async getUserSubscription(userId: number): Promise<Subscription | null> {
    const query = `
      SELECT us.*, sp.name as plan_name, sp.slug as plan_slug
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ? AND us.is_active = 1 AND us.expires_at > CURRENT_TIMESTAMP
      ORDER BY us.expires_at DESC
      LIMIT 1
    `;
    const rows = await database.query(query, [userId]);
    
    if (!rows || rows.length === 0) {
      return null;
    }
    
    return rows[0];
  }

  static async createSubscription(userId: number, planSlug: string, paymentRef?: string): Promise<Subscription | null> {
    // 1. Get plan details
    let plans = await database.query('SELECT id, duration_months FROM subscription_plans WHERE slug = ?', [planSlug]);
    
    // Auto-seed if plans table is empty (Self-healing)
    if (!plans || plans.length === 0) {
      console.log('🌱 No plans found, auto-seeding subscription_plans...');
      const seedPlans = [
        { name: 'Basic Plan', slug: 'basic', duration: 3, price: 399.00 },
        { name: 'Standard Plan', slug: 'standard', duration: 6, price: 599.00 },
        { name: 'Premium Plan', slug: 'premium', duration: 12, price: 999.00 },
        { name: 'Accountant Plan', slug: 'accountant', duration: 12, price: 3999.00 }
      ];
      for (const p of seedPlans) {
        await database.query('INSERT IGNORE INTO subscription_plans (name, slug, duration_months, price) VALUES (?, ?, ?, ?)', [p.name, p.slug, p.duration, p.price]);
      }
      // Try again
      plans = await database.query('SELECT id, duration_months FROM subscription_plans WHERE slug = ?', [planSlug]);
    }

    if (!plans || plans.length === 0) return null;
    
    const plan = plans[0];
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + plan.duration_months);

    // 2. Deactivate any existing subscriptions
    await database.query('UPDATE user_subscriptions SET is_active = 0 WHERE user_id = ?', [userId]);

    // 3. Create new subscription
    const query = `
      INSERT INTO user_subscriptions (user_id, plan_id, expires_at, payment_reference)
      VALUES (?, ?, ?, ?)
    `;
    const result = await database.query(query, [userId, plan.id, expiresAt, paymentRef || 'MANUAL']);

    return this.getUserSubscription(userId);
  }
}
