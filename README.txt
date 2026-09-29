# Nepal News Portal with Admin Panel

Files:
- index.html : public news website
- admin.html : admin login + add/edit/delete news
- style.css : public site styles
- admin.css : admin styles
- config.js : Supabase URL + anon key
- script.js : public site data loading
- admin.js : admin CRUD
- supabase-setup.sql : run once in Supabase SQL Editor

Setup:
1. Create a Supabase project.
2. Run supabase-setup.sql in SQL Editor.
3. Authentication -> Users -> Add user. Create your admin email/password.
4. Project Settings -> API:
   - copy Project URL
   - copy anon/public key
5. Paste both into config.js.
6. Upload all files to GitHub.
7. Vercel will redeploy automatically.
8. Open /admin.html and log in.
