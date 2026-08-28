import re

with open('src/context/academic.jsx', 'r') as f:
    content = f.read()

# Fix loadSchools
# We need to ensure we don't fall back to `data[0].id` and we filter for Director.
new_load_schools = """
  const loadSchools = useCallback(async () => {
    try {
      const response = await apiClient.get('/academic/schools');
      let data = unwrapList(response).map(normalizeSchool);
      
      if (role === 'DIRECTOR') {
         data = data.filter(s => s.id === user?.schoolId);
      }
      
      setSchools(data);

      if (data.length > 0) {
        const scopedSchool = data.find((school) => school.id === user?.schoolId);
        if (scopedSchool) {
          setSelectedSchoolId(scopedSchool.id);
        } else if (role === 'ADMIN') {
           // Admin can select anything, but we shouldn't fallback to schools[0] automatically
           // Wait, prompt says: "Never fall back to schools[0]... when the authenticated scope is absent"
           // So just do nothing if no scope. But for ADMIN, they have no schoolId usually. So they just don't have a selection initially, or we leave it null.
           // Actually, let's just not set it to data[0].id
        }
      } else {
        setSelectedSchoolId(null);
      }

      return data;
    } catch (err) {
      console.warn('loadSchools failed:', err);
      return [];
    }
  }, [user?.schoolId, role]);
"""
content = re.sub(r'const loadSchools = useCallback\(async \(\) => \{.*?\}, \[user\?\.schoolId\]\);', new_load_schools.strip(), content, flags=re.DOTALL)

# Fix loadDepartments
# HOD must only see their department
new_load_departments = """
  const loadDepartments = useCallback(async (targetSchoolId = null) => {
    try {
      const params = targetSchoolId ? { schoolId: targetSchoolId } : {};
      const response = await apiClient.get('/academic/departments', { params });
      let data = unwrapList(response).map(normalizeDepartment);
      
      if (role === 'HOD') {
         data = data.filter(d => d.id === user?.departmentId);
      }
      
      setDepartments(data);
      return data;
    } catch (err) {
      console.warn('loadDepartments failed:', err);
      return [];
    }
  }, [role, user?.departmentId]);
"""
content = re.sub(r'const loadDepartments = useCallback\(async \(targetSchoolId = null\) => \{.*?\}, \[\]\);', new_load_departments.strip(), content, flags=re.DOTALL)

with open('src/context/academic.jsx', 'w') as f:
    f.write(content)
