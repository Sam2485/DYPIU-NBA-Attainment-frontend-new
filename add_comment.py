with open('src/routes/AppRoutes.jsx', 'r') as f:
    content = f.read()

comment = """
/*
 * IMPORTANT SECURITY NOTICE:
 * Frontend route guards (RoleProtectedRoute) and scope limitations (e.g. academic loaders)
 * are implemented here to improve UX ONLY.
 * 
 * You must assume the backend must independently derive scope from the JWT and deny 
 * cross-scope requests, even if a client manipulates request parameters or bypasses the UI.
 * Do not rely on selectable IDs, emails, or query parameters as authorization.
 */
"""

content = comment + "\n" + content

with open('src/routes/AppRoutes.jsx', 'w') as f:
    f.write(content)
