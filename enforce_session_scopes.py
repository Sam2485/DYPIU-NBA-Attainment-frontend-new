import re

with open('src/context/academic.jsx', 'r') as f:
    content = f.read()

# Replace the HOD department selection effect
hod_dept_effect = """
  useEffect(() => {
    if (role !== 'HOD') return;
    const persistedDepartmentId = typeof window === 'undefined'
      ? null
      : sessionStorage.getItem(getHodDepartmentStorageKey());
    
    // HOD department selection must be fixed to user.departmentId
    if (persistedDepartmentId && persistedDepartmentId !== user?.departmentId) {
      sessionStorage.removeItem(getHodDepartmentStorageKey());
    }
    
    if (user?.departmentId && selectedDepartmentId !== user?.departmentId) {
       setSelectedDepartmentIdState(user?.departmentId);
    }
  }, [getHodDepartmentStorageKey, role, selectedDepartmentId, user?.departmentId]);
"""
content = re.sub(r'useEffect\(\(\) => \{\s*if \(role !== \'HOD\' \|\| selectedDepartmentId\) return;.*?\}, \[getHodDepartmentStorageKey, role, selectedDepartmentId, user\?\.departmentId\]\);', hod_dept_effect.strip(), content, flags=re.DOTALL)

with open('src/context/academic.jsx', 'w') as f:
    f.write(content)
