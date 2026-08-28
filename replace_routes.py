import re

with open('src/routes/AppRoutes.jsx', 'r') as f:
    content = f.read()

# Replace ProtectedRoute definition with RoleProtectedRoute
new_protected_route = """
function RoleProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isRestoringSession, role } = useAuth();
  const location = useLocation();

  if (isRestoringSession) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <ErrorBoundary isScreen>
      {children}
    </ErrorBoundary>
  );
}
"""

content = re.sub(r'function ProtectedRoute.*?ErrorBoundary>\s*\);\s*}', new_protected_route, content, flags=re.DOTALL)
content = re.sub(r'function AdminRoute.*?return children;\s*}', '', content, flags=re.DOTALL)

# Now replace usages
# Default authenticated
content = content.replace('<ProtectedRoute>', '<RoleProtectedRoute allowedRoles={[]}>')
content = content.replace('</ProtectedRoute>', '</RoleProtectedRoute>')
content = content.replace('<AdminRoute>', '')
content = content.replace('</AdminRoute>', '')

# Define regex to replace allowedRoles for specific paths
def set_roles(path_prefix, roles_str):
    global content
    pattern = r'(path="' + path_prefix + r'[^"]*"\s*element=\{\s*<RoleProtectedRoute allowedRoles=\{)\[\](\})'
    content = re.sub(pattern, r'\g<1>' + roles_str + r'\2', content)

# Path prefixes and roles
set_roles('/admin/', "['ADMIN']")
set_roles('/users', "['ADMIN']")
set_roles('/director/', "['ADMIN', 'DIRECTOR']")
set_roles('/hod/', "['ADMIN', 'HOD']")
set_roles('/programme-coordinator/', "['ADMIN', 'PROGRAMME_COORDINATOR']")
set_roles('/course-coordinator/', "['ADMIN', 'FACULTY']")

# The rest (Academic pages, reports, etc.)
academic_roles = "['ADMIN', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR', 'FACULTY']"
set_roles('/dashboard', academic_roles)
set_roles('/configurations', academic_roles)
set_roles('/attainment-config', academic_roles)
set_roles('/academic', "['ADMIN', 'DIRECTOR', 'HOD']")
set_roles('/outcomes', academic_roles)
set_roles('/co-targets', "['ADMIN', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR']")
set_roles('/co-mapping', academic_roles)
set_roles('/marks-upload', academic_roles)
set_roles('/survey-upload', academic_roles)
set_roles('/co-attainment', academic_roles)
set_roles('/po-pso-attainment', academic_roles)
set_roles('/attainment-overview', academic_roles)
set_roles('/course-atr', academic_roles)
set_roles('/atr-reports', academic_roles)
set_roles('/programme-atr', "['ADMIN', 'DIRECTOR', 'HOD', 'PROGRAMME_COORDINATOR']")
set_roles('/coordinator-review', "['ADMIN', 'PROGRAMME_COORDINATOR', 'HOD']")
set_roles('/reports', academic_roles)


with open('src/routes/AppRoutes.jsx', 'w') as f:
    f.write(content)
