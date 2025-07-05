import { fetchPricingPlans } from '../lib/pricing';
import { PricingSection } from './pricing-section';

/**
 * Server component that fetches pricing plans from the database
 * and passes them to the client component
 */
export async function PricingSectionWithData() {
  // Fetch plans from the database
  // This runs on the server and can access the database directly
  const plans = await fetchPricingPlans();
  
  // Pass the fetched plans to the client component
  return <PricingSection plans={plans} />;
}