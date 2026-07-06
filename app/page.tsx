import { getAllOrganizationCategoryNames } from '@/app/organization/actions/Get';
import HomeClient from './HomeClient';

export default async function Home() {
  const names = await getAllOrganizationCategoryNames();
  return <HomeClient orgNames={names.map(n => ({ name: n }))} />;
}
