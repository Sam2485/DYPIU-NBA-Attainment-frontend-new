import { useAcademic as useAcademicCore } from './academic';
import { useAttainment } from './attainment';
import { useApproval } from './approval';
import { useDashboard } from './dashboard';

export * from './academic';
export * from './attainment';
export * from './approval';
export * from './user';
export { AcademicProvider } from './academic';

export function useAcademic() {
  const academic = useAcademicCore();
  const attainment = useAttainment();
  const approval = useApproval();
  const dashboard = useDashboard();

  return {
    ...academic,
    ...attainment,
    ...approval,
    ...dashboard,
  };
}

export default useAcademic;
