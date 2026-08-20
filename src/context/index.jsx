import { AuthProvider, useAuth } from './auth';
import { UserProvider, useUser } from './user';
import { AcademicProvider, useAcademic } from './academic';
import { AttainmentProvider, useAttainment } from './attainment';
import { ApprovalProvider, useApproval } from './approval';
import { ReportsProvider, useReports } from './reports';
import { DashboardProvider, useDashboard } from './dashboard';

/* -------------------------------------------------------------------------- */
/* Context exports                                                            */
/* -------------------------------------------------------------------------- */

export {
  AuthProvider,
  useAuth,

  UserProvider,
  useUser,

  AcademicProvider,
  useAcademic,

  AttainmentProvider,
  useAttainment,

  ApprovalProvider,
  useApproval,

  ReportsProvider,
  useReports,

  DashboardProvider,
  useDashboard,
};

/* -------------------------------------------------------------------------- */
/* Application Provider                                                       */
/* -------------------------------------------------------------------------- */

export function AppProvider({
  children,
}) {
  return (
    <AuthProvider>
      <UserProvider>
        <AcademicProvider>
          <AttainmentProvider>
            <ApprovalProvider>
              <ReportsProvider>
                <DashboardProvider>
                  {children}
                </DashboardProvider>
              </ReportsProvider>
            </ApprovalProvider>
          </AttainmentProvider>
        </AcademicProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default AppProvider;