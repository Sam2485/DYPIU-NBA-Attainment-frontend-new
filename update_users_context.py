import re

with open('src/context/user.jsx', 'r') as f:
    content = f.read()

# We need to import useAuth and use it.
# Check if useAuth is imported
if 'import { useAuth }' not in content:
    content = content.replace("import apiClient from '../api/client';", "import apiClient from '../api/client';\nimport { useAuth } from './auth';")

# In UserProvider, get role and user
provider_sig = """
export function UserProvider({
  children,
}) {
  const { role, user: currentUser } = useAuth();
"""
content = re.sub(r'export function UserProvider\(\{\s*children,\s*\}\) \{', provider_sig.strip(), content)

# Update loadUsers
load_users_regex = r'const response =\s*await apiClient\.get\(\s*\'/users\'\s*\);'
load_users_replacement = """
        const params = {};
        if (role === 'DIRECTOR') params.schoolId = currentUser?.schoolId;
        if (role === 'HOD') params.departmentId = currentUser?.departmentId;
        if (role === 'PROGRAMME_COORDINATOR') params.programmeId = currentUser?.programmeId;
        const response = await apiClient.get('/users', { params });
"""
content = re.sub(load_users_regex, load_users_replacement.strip(), content)

# Update refreshUsers
refresh_users_regex = r'const response =\s*await apiClient\.get\(\s*\'/users\'\s*\);'
content = re.sub(refresh_users_regex, load_users_replacement.strip(), content)

with open('src/context/user.jsx', 'w') as f:
    f.write(content)
