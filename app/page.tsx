import { getAllOrganizationCategoryNames, getAllOrganizations } from '@/app/organization/actions/Get';
import HomeClient from './HomeClient';

export default async function Home() {
  const currentYear = new Date().getFullYear();
  const [names, orgResult] = await Promise.all([
    getAllOrganizationCategoryNames(),
    getAllOrganizations({ year: currentYear, limit: 1 }),
  ]);
  return <HomeClient orgNames={names.map(n => ({ name: n }))} totalOrganizations={orgResult.total} />;
}
